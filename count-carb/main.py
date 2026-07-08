"""
Agente simples que analisa uma foto de um prato de comida
e retorna os ingredientes identificados, em formato JSON.

Requisitos:
    pip install anthropic

Configuração:
    Defina sua chave de API como variável de ambiente:
        export ANTHROPIC_API_KEY="sua-chave-aqui"
"""

import base64
import json
import mimetypes
import random
import sys
import tempfile
import time
from pathlib import Path
from typing import Any, Literal

import anthropic
from anthropic.types import Message, MessageParam
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile

load_dotenv(Path(__file__).with_name(".env"))

MediaType = Literal["image/jpeg", "image/png", "image/webp", "image/gif"]
SUPPORTED_MEDIA_TYPES = ("image/jpeg", "image/png", "image/webp", "image/gif")

app = FastAPI(title="Sangue Doce Count Carb API")


def resposta_padrao(**overrides: Any) -> dict[str, Any]:
    resposta: dict[str, Any] = {
        "ingredientes": [],
        "confianca": "baixa",
        "observacoes": "",
        "carboidratos": None,
        "proteinas": None,
        "gorduras": None,
        "glicose_estimada": None,
    }
    resposta.update(overrides)
    return resposta


def criar_mensagem_com_retry(
    client: anthropic.Anthropic,
    max_tentativas: int = 4,
    espera_base: float = 2.0,
    **kwargs,
) -> Message:
    """Chama client.messages.create com retry e backoff exponencial.

    Cobre casos como a API estar temporariamente fora do ar (5xx),
    rate limit (429) ou falha de conexão.
    """
    ultimo_erro: Exception | None = None

    for tentativa in range(max_tentativas):
        try:
            return client.messages.create(**kwargs)
        except anthropic.RateLimitError as erro:
            ultimo_erro = erro
        except anthropic.APIStatusError as erro:
            if erro.status_code >= 500:
                ultimo_erro = erro
            else:
                raise  # erro do cliente (4xx) não deve ser repetido
        except anthropic.APIConnectionError as erro:
            ultimo_erro = erro

        if tentativa < max_tentativas - 1:
            espera = espera_base * (2**tentativa) + random.uniform(0, 1)
            print(
                f"Falha ao chamar a API (tentativa {tentativa + 1}/{max_tentativas}). "
                f"Tentando novamente em {espera:.1f}s...",
                file=sys.stderr,
            )
            time.sleep(espera)

    assert ultimo_erro is not None
    raise ultimo_erro


def carregar_imagem_base64(caminho_imagem: str) -> tuple[str, MediaType]:
    """Lê a imagem do disco e retorna (base64_data, media_type)."""
    caminho = Path(caminho_imagem)
    media_type, _ = mimetypes.guess_type(caminho)
    if media_type not in SUPPORTED_MEDIA_TYPES:
        raise ValueError(f"Tipo de imagem não suportado: {media_type}")

    dados = caminho.read_bytes()
    return base64.standard_b64encode(dados).decode("utf-8"), media_type


def identificar_ingredientes(caminho_imagem: str) -> dict:
    """Envia a imagem para o Claude e pede a lista de ingredientes em JSON."""
    client = anthropic.Anthropic()  # usa ANTHROPIC_API_KEY do ambiente

    imagem_b64, media_type = carregar_imagem_base64(caminho_imagem)

    prompt = (
        "Você é um assistente especializado em identificar ingredientes de pratos "
        "de comida em fotos. Observe a imagem e responda APENAS com um objeto JSON "
        "válido, sem markdown e sem nenhum texto antes ou depois.\n\n"
        "O JSON deve ter SEMPRE exatamente estas chaves principais:\n"
        "{\n"
        '  "ingredientes": ["arroz branco", "frango grelhado"],\n'
        '  "confianca": "alta",\n'
        '  "observacoes": "algo relevante, se houver",\n'
        '  "carboidratos": 45,\n'
        '  "proteinas": 28,\n'
        '  "gorduras": 12,\n'
        '  "glicose_estimada": 55\n'
        "}\n\n"
        'Use "confianca" somente como "alta", "media" ou "baixa". '
        "Use números inteiros para carboidratos, proteinas, gorduras e glicose_estimada, "
        "sem unidade e sem texto. Se não conseguir estimar algum número, use null. "
        "Liste apenas o que você conseguir identificar com razoável certeza visual, "
        "e seja conciso. Se não conseguir identificar nada, retorne ingredientes como lista vazia, "
        'confianca "baixa", observacoes explicando o motivo e os números como null. '
        'Se houver bebidas, tente identificar também; inclua marca e volume quando visíveis, exemplo: '
        '"Coca-Cola 350ml", "Heineken 600ml", "Guaraná Antarctica 2L". '
        "A glicose_estimada deve ser uma referência aproximada, em mg/dL, de quanto a glicemia "
        "pode subir com o prato."
    )

    mensagens: list[MessageParam] = [
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": media_type,
                        "data": imagem_b64,
                    },
                },
                {"type": "text", "text": prompt},
            ],
        }
    ]

    resposta = criar_mensagem_com_retry(
        client,
        model="claude-sonnet-4-6",
        max_tokens=2000,
        messages=mensagens,
    )

    if resposta.stop_reason == "max_tokens":
        return resposta_padrao(
            erro="Resposta cortada por atingir max_tokens antes de terminar o JSON",
            bruto=next(
                (b.text for b in resposta.content if b.type == "text"), ""
            ),
        )

    bloco_texto = next((b for b in resposta.content if b.type == "text"), None)
    if bloco_texto is None:
        return resposta_padrao(
            erro="Resposta não contém texto", bruto=str(resposta.content)
        )

    texto = bloco_texto.text.strip()

    # remove possíveis blocos de código ```json ... ```
    texto = texto.replace("```json", "").replace("```", "").strip()

    try:
        return normalizar_resposta(json.loads(texto))
    except json.JSONDecodeError:
        return resposta_padrao(erro="Resposta não veio em JSON válido", bruto=texto)


def normalizar_resposta(payload: Any) -> dict[str, Any]:
    """Garante o contrato esperado pelo backend NestJS."""
    if not isinstance(payload, dict):
        return resposta_padrao(
            erro="Resposta não veio como objeto JSON",
            bruto=json.dumps(payload, ensure_ascii=False),
        )

    ingredientes = payload.get("ingredientes", [])
    if isinstance(ingredientes, str):
        ingredientes = [item.strip() for item in ingredientes.split(",") if item.strip()]
    if not isinstance(ingredientes, list):
        ingredientes = []

    confianca = str(payload.get("confianca", "baixa")).lower().strip()
    if confianca not in {"alta", "media", "baixa"}:
        confianca = "baixa"

    resposta_normalizada = resposta_padrao(
        ingredientes=[str(item) for item in ingredientes],
        confianca=confianca,
        observacoes=str(payload.get("observacoes") or ""),
        carboidratos=extrair_numero(
            payload.get("carboidratos")
            or payload.get("carboidratos_estimados")
            or payload.get("total_carboidratos")
            or payload.get("carbs")
        ),
        proteinas=extrair_numero(payload.get("proteinas") or payload.get("proteínas")),
        gorduras=extrair_numero(payload.get("gorduras")),
        glicose_estimada=extrair_numero(
            payload.get("glicose_estimada")
            or payload.get("glucose_estimada")
            or payload.get("aumento_glicemia")
        ),
    )

    if payload.get("erro"):
        resposta_normalizada["erro"] = payload["erro"]
    if payload.get("bruto"):
        resposta_normalizada["bruto"] = payload["bruto"]

    return resposta_normalizada


def extrair_numero(value: Any) -> int | None:
    if isinstance(value, bool) or value is None:
        return None

    if isinstance(value, (int, float)):
        return round(value)

    if not isinstance(value, str):
        return None

    digits = "".join(
        char if char.isdigit() or char in {",", "."} else " " for char in value
    )
    first_number = next((part for part in digits.split() if part), None)

    if first_number is None:
        return None

    try:
        return round(float(first_number.replace(",", ".")))
    except ValueError:
        return None


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/analyze")
async def analyze(image: UploadFile = File(...)) -> dict:
    if image.content_type not in SUPPORTED_MEDIA_TYPES:
        raise HTTPException(status_code=400, detail="Tipo de imagem não suportado.")

    suffix = Path(image.filename or "").suffix or ".jpg"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as temp_file:
        temp_path = Path(temp_file.name)
        temp_file.write(await image.read())

    try:
        return identificar_ingredientes(str(temp_path))
    finally:
        temp_path.unlink(missing_ok=True)


def serve() -> None:
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8020, reload=True)


def main() -> None:
    if len(sys.argv) >= 2 and sys.argv[1] == "serve":
        serve()
        return

    script_dir = Path(__file__).resolve().parent
    caminho = sys.argv[1] if len(sys.argv) >= 2 else str(script_dir / "comida.jpeg")
    resultado = identificar_ingredientes(caminho)
    saida = json.dumps(resultado, ensure_ascii=False, indent=2)
    print(saida)

    if len(sys.argv) < 2:
        (script_dir / "relatorio.json").write_text(saida, encoding="utf-8")


if __name__ == "__main__":
    main()
