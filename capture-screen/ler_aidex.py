#!/usr/bin/env python3
"""Lê o valor de glicose em capturas de tela do Aidex com Tesseract."""

import argparse
import csv
import io
import re
import sys
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError


def ler_glicose(caminho: Path) -> int:
    with Image.open(caminho) as imagem:
        imagem = ImageOps.exif_transpose(imagem).convert("L")
        largura, altura = imagem.size
        # Região do número dentro do círculo, relativa ao tamanho da captura.
        imagem = imagem.crop((int(largura * 0.18), int(largura * 0.44),
                              int(largura * 0.43), int(largura * 0.57)))
        imagem = ImageOps.autocontrast(imagem.resize((imagem.width * 4, imagem.height * 4)))
        imagem = imagem.point(lambda pixel: 0 if pixel < 150 else 255)
        with tempfile.TemporaryDirectory() as diretorio:
            recorte = Path(diretorio) / "recorte.png"
            imagem.save(recorte)
            resultado = subprocess.run(
                ["tesseract", str(recorte), "stdout", "--psm", "7",
                 "-c", "tessedit_char_whitelist=0123456789"],
                capture_output=True, text=True, check=True,
            )
            texto = resultado.stdout.strip()
    if not re.fullmatch(r"\d{2,3}", texto):
        raise ValueError("Não foi possível reconhecer a leitura na imagem.")
    return int(texto)



def estimar_horario(caminho: Path) -> str:
    """Interpola a posição do último ponto entre os horários do eixo X."""
    resultado = subprocess.run(
        ["tesseract", str(caminho), "stdout", "--psm", "11", "tsv"],
        capture_output=True, text=True, check=True,
    )
    with Image.open(caminho) as original:
        imagem = ImageOps.exif_transpose(original).convert("RGB")
        largura, altura = imagem.size
        marcacoes = []
        for linha in csv.DictReader(io.StringIO(resultado.stdout), delimiter="\t"):
            texto = linha["text"].strip()
            match = re.fullmatch(r"(\d{1,2}):(\d{2})", texto)
            if not match or not largura * 1.80 < int(linha["top"]) < largura * 2.00:
                continue
            hora, minuto = map(int, match.groups())
            if hora < 24 and minuto < 60:
                centro = int(linha["left"]) + int(linha["width"]) / 2
                marcacoes.append((centro, hora * 60 + minuto))
        if len(marcacoes) < 2:
            raise ValueError("Não foi possível identificar os horários do gráfico.")
        marcacoes.sort()
        # Ajusta horas após a meia-noite para manter o eixo crescente.
        ajustadas = []
        for x, minutos in marcacoes:
            if ajustadas and minutos < ajustadas[-1][1] % (24 * 60):
                if ajustadas[-1][1] % (24 * 60) >= 22 * 60 and minutos < 2 * 60:
                    minutos += 24 * 60
                else:
                    continue  # Ignora horário mal reconhecido pelo OCR.
            elif ajustadas and ajustadas[-1][1] >= 24 * 60:
                minutos += 24 * 60
            ajustadas.append((x, minutos))
        if len(ajustadas) < 2:
            raise ValueError("Não foi possível calibrar o eixo de horários.")
        media_x = sum(x for x, _ in ajustadas) / len(ajustadas)
        media_t = sum(t for _, t in ajustadas) / len(ajustadas)
        denominador = sum((x - media_x) ** 2 for x, _ in ajustadas)
        if not denominador:
            raise ValueError("Não foi possível calibrar o eixo de horários.")
        escala = sum((x - media_x) * (t - media_t) for x, t in ajustadas) / denominador
        pixels = imagem.load()
        pontos = []
        for y in range(int(largura * 1.43), min(altura, int(largura * 1.78))):
            for x in range(int(largura * 0.05), int(largura * 0.93)):
                r, g, b = pixels[x, y]
                if 50 < g < 210 and g > r * 1.12 and g > b * 1.15:
                    pontos.append((x, y))
        if not pontos:
            raise ValueError("Não foi possível identificar a curva verde do gráfico.")
        # O marcador circular tem borda: usa o centro dos pixels próximos à extremidade.
        extremo = max(x for x, _ in pontos)
        fim = [x for x, _ in pontos if x >= extremo - largura * 0.012]
        x_final = (min(fim) + max(fim)) / 2
        minutos = round(media_t + escala * (x_final - media_x)) % (24 * 60)
        return f"{minutos // 60:02d}:{minutos % 60:02d}"

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("imagem", type=Path, help="Caminho da captura de tela do Aidex")
    args = parser.parse_args()
    try:
        valor = ler_glicose(args.imagem)
    except (OSError, UnidentifiedImageError, ValueError, subprocess.CalledProcessError) as erro:
        print(f"Erro ao ler a imagem: {erro}", file=sys.stderr)
        return 1
    print(f"Glicose: {valor} mg/dL")
    try:
        horario = estimar_horario(args.imagem)
        print(f"Horário estimado da última marcação: {horario}")
    except (OSError, ValueError, subprocess.CalledProcessError) as erro:
        print(f"Não foi possível estimar o horário: {erro}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
