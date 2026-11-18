"""Leitura do layout de glicose e gráfico do aplicativo AiDEX/LinX."""
import re
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps


def is_aidex(text: str) -> bool:
    # A duração restante e o texto de minutos são característicos desta tela.
    return bool(re.search(r"\brestam\b[^\n]*\bdias\b", text, re.I)
                and re.search(r"\bminutos?\b", text, re.I))


def read_digits(path: Path, image_to_string) -> int | None:
    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source).convert("L")
        width = image.width
        image = image.crop((int(width * .18), int(width * .44), int(width * .43), int(width * .57)))
        image = ImageOps.autocontrast(image.resize((image.width * 4, image.height * 4)))
        image = image.point(lambda pixel: 0 if pixel < 150 else 255)
        text = image_to_string(image, config="--psm 7 -c tessedit_char_whitelist=0123456789").strip()
    return int(text) if re.fullmatch(r"\d{2,3}", text) else None


def estimate_chart_time(path: Path, image_to_data) -> tuple[str | None, str]:
    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")
        width, height = image.size
        data = image_to_data(image, config="--psm 11", output_type="dict")
        ticks = []
        for index, text in enumerate(data["text"]):
            match = re.fullmatch(r"(\d{1,2}):(\d{2})", text.strip())
            if not match or not width * 1.80 < data["top"][index] < width * 2.00:
                continue
            hour, minute = map(int, match.groups())
            if hour < 24 and minute == 0:
                ticks.append((data["left"][index] + data["width"][index] / 2, hour * 60))
        ticks.sort()
        adjusted = []
        for x, minute in ticks:
            if adjusted:
                previous = adjusted[-1][1]
                if previous % 1440 >= 22 * 60 and minute < 2 * 60:
                    minute += 1440
                elif previous >= 1440:
                    minute += 1440
                if minute <= previous:
                    continue
            adjusted.append((x, minute))
        if len(adjusted) < 2:
            return None, "baixa"
        xs = np.array([x for x, _ in adjusted])
        ts = np.array([t for _, t in adjusted])
        # Ticks consecutivos devem corresponder ao espaçamento uniforme do eixo.
        slopes = np.diff(ts) / np.diff(xs)
        if np.any(slopes <= 0) or np.max(slopes) > 1.5 * np.min(slopes):
            return None, "baixa"
        pixels = np.asarray(image, dtype=np.float32)
        y0, y1 = int(width * 1.43), min(height, int(width * 1.78))
        x0, x1 = int(width * .05), min(width, int(width * .93))
        region = pixels[y0:y1, x0:x1]
        red, green, blue = region[:, :, 0], region[:, :, 1], region[:, :, 2]
        mask = (green > 50) & (green < 210) & (green > red * 1.12) & (green > blue * 1.15)
        _, columns = np.nonzero(mask)
        if not len(columns):
            return None, "baixa"
        extreme = columns.max() + x0
        near_end = columns[columns + x0 >= extreme - width * .012] + x0
        endpoint = (near_end.min() + near_end.max()) / 2
        slope = np.sum((xs - xs.mean()) * (ts - ts.mean())) / np.sum((xs - xs.mean()) ** 2)
        minutes = round(ts.mean() + slope * (endpoint - xs.mean())) % 1440
        return f"{minutes // 60:02d}:{minutes % 60:02d}", "media"
