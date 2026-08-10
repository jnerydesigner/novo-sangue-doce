#!/usr/bin/env python3
"""Extrai leitura e data/horário de prints do Sibionics usando OCR local."""

import argparse
import json
import re
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import cv2
import numpy as np
try:
    import pytesseract
except ModuleNotFoundError as error:
    raise SystemExit(
        "Dependência ausente. Execute: "
        "python3 -m pip install -r capture-screen/requirements.txt"
    ) from error


DATE = r"(?:0?[1-9]|[12]\d|3[01])[/.-](?:0?[1-9]|1[0-2])[/.-](?:20)?\d{2}"
TIME = r"(?:[01]?\d|2[0-3])[:h][0-5]\d"


def ocr(path: Path) -> str:
    image = Image.open(path).convert("L")
    # Aumenta a imagem e melhora contraste para funcionar melhor em screenshots.
    image = image.resize((image.width * 2, image.height * 2))
    image = ImageOps.autocontrast(image)
    image = ImageEnhance.Sharpness(image).enhance(2)
    image = image.filter(ImageFilter.SHARPEN)
    return pytesseract.image_to_string(image, lang="por+eng", config="--psm 6")


def ocr_cartao_atual(path: Path) -> str:
    """Lê apenas o cartão superior, que contém a leitura atual e a data."""
    image = Image.open(path).convert("L")
    # O cartão superior ocupa aproximadamente os 40% iniciais do print.
    image = image.crop((0, 0, image.width, int(image.height * 0.40)))
    image = image.resize((image.width * 2, image.height * 2))
    image = ImageOps.autocontrast(image)
    return pytesseract.image_to_string(image, lang="por+eng", config="--psm 6")


def ocr_digitos_leitura(path: Path) -> str:
    """OCR focado apenas nos dígitos grandes do cartão verde."""
    image = Image.open(path).convert("L")
    width, height = image.size
    # Área relativa dos dígitos grandes (99) no cartão superior.
    image = image.crop((int(width * 0.27), int(height * 0.135), int(width * 0.56), int(height * 0.22)))
    image = image.resize((image.width * 4, image.height * 4))
    image = ImageOps.autocontrast(image)
    image = image.point(lambda pixel: 0 if pixel < 150 else 255)
    return pytesseract.image_to_string(
        image, config="--psm 7 -c tessedit_char_whitelist=0123456789"
    )


def first(pattern: str, text: str) -> str | None:
    match = re.search(pattern, text, flags=re.IGNORECASE)
    return match.group(1) if match else None


def extract(text: str) -> dict:
    clean = re.sub(r"[ \t]+", " ", text)
    # No Sibionics, a leitura isolada em mg/dL aparece em destaque no cartão superior.
    readings = [int(value) for value in re.findall(r"\b(\d{2,3})\s*mg\s*/?\s*dL\b", clean, re.I)]
    dates = re.findall(rf"({DATE})", clean, re.I)
    times = re.findall(rf"({TIME})", clean, re.I)
    return {
        "leitura_atual_mg_dl": readings[0] if readings else None,
        "data": dates[0].replace(".", "/").replace("-", "/") if dates else None,
        "horarios_encontrados": [t.replace("h", ":") for t in times],
        "leituras_mg_dl_encontradas": readings,
        "texto_ocr": text.strip(),
    }


def extrair_leitura_atual(texto_cartao: str, texto_completo: str) -> int | None:
    """Prioriza o valor do cartão superior; o OCR completo é fallback."""
    for texto in (texto_cartao, texto_completo):
        readings = re.findall(r"\b(\d{2,3})\s*mg\s*/?\s*dL\b", texto, re.I)
        if readings:
            return int(readings[0])
    return None


def extrair_digitos_atual(texto: str) -> int | None:
    valores = re.findall(r"\b\d{2,3}\b", texto)
    return int(valores[0]) if valores else None


def timestamp_do_arquivo(path: Path) -> str | None:
    """Lê o horário de nomes como '... 2026-08-10 at 13.12.40.jpeg'."""
    match = re.search(r"(20\d{2})[-.](\d{2})[-.](\d{2}).*?(\d{2})[.:](\d{2})[.:](\d{2})", path.name)
    if not match:
        return None
    values = match.groups()
    return datetime.strptime("".join(values), "%Y%m%d%H%M%S").isoformat()


def estimar_horario_pelo_grafico(path: Path) -> tuple[str | None, str]:
    """Estima o horário pelo ponto azul mais à direita do gráfico de 3 horas."""
    image = cv2.imread(str(path))
    if image is None:
        return None, "baixa"
    height, width = image.shape[:2]
    # Região relativa ao gráfico: evita textos, cartões e os botões superiores.
    x0, x1 = int(width * 0.13), int(width * 0.90)
    y0, y1 = int(height * 0.53), int(height * 0.76)
    crop = image[y0:y1, x0:x1]
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    # Pontos da curva são azul-escuros; o fundo azul-claro tem pouca saturação.
    mask = cv2.inRange(hsv, np.array([85, 45, 35]), np.array([125, 210, 190]))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    points = []
    for contour in contours:
        area = cv2.contourArea(contour)
        x, y, w, h = cv2.boundingRect(contour)
        if 2 <= area <= 80 and 2 <= w <= 18 and 2 <= h <= 18:
            points.append((x + w / 2, y + h / 2))
    if not points:
        return None, "baixa"
    rightmost_x = max(x for x, _ in points)
    # O gráfico exibido é de 11:00 a 14:00. Usa margens relativas do gráfico.
    graph_left, graph_right = width * 0.135, width * 0.895
    fraction = min(1.0, max(0.0, (x0 + rightmost_x - graph_left) / (graph_right - graph_left)))
    minutes = round((11 * 60 + fraction * 180) / 5) * 5
    hour, minute = divmod(minutes, 60)
    return f"{hour:02d}:{minute:02d}", "media"


def nome_saida(result: dict, imagem: Path) -> Path:
    # O nome representa a geração do JSON, não o timestamp do WhatsApp.
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
    pasta = imagem.parent / "out"
    return pasta / f"sibionics_{timestamp}.json"


def main() -> None:
    parser = argparse.ArgumentParser(description="Lê dados de um print do Sibionics")
    parser.add_argument("imagem", type=Path)
    parser.add_argument("--saida", type=Path, help="salva o JSON neste arquivo (padrão: capture-screen/out)")
    parser.add_argument(
        "--horario-envio",
        help="horário real do envio pelo app, em ISO 8601; fica nulo se omitido",
    )
    args = parser.parse_args()
    if not args.imagem.is_file():
        parser.error(f"imagem não encontrada: {args.imagem}")
    texto_completo = ocr(args.imagem)
    result = extract(texto_completo)
    digitos_atual = extrair_digitos_atual(ocr_digitos_leitura(args.imagem))
    result["leitura_atual_mg_dl"] = digitos_atual or extrair_leitura_atual(
        ocr_cartao_atual(args.imagem), texto_completo
    )
    result["timestamp_nome_arquivo_whatsapp"] = timestamp_do_arquivo(args.imagem)
    result["horario_envio"] = args.horario_envio
    result["horario_leitura_estimado"], result["confianca_horario"] = estimar_horario_pelo_grafico(args.imagem)
    saida = args.saida or nome_saida(result, args.imagem)
    saida.parent.mkdir(parents=True, exist_ok=True)
    output = json.dumps(result, ensure_ascii=False, indent=2)
    print(output)
    saida.write_text(output + "\n", encoding="utf-8")
    print(f"\nJSON salvo em: {saida}")


if __name__ == "__main__":
    main()
