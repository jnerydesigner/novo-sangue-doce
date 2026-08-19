import logging
from pathlib import Path
from tempfile import NamedTemporaryFile

import cv2
import numpy as np
from fastapi import UploadFile
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

from app.schemas.measurement_image import (
    MeasurementImageEvidence,
    MeasurementImageResponse,
    MeasurementIngestionContract,
)
from app.services.measurement_contract import (
    build_measured_at,
    classify_measurement_moment,
    extract_basic_evidence,
    extract_digits_reading,
    extract_reading_from_card,
    timestamp_from_filename,
)

try:
    import pytesseract
    from pytesseract import TesseractNotFoundError
except ModuleNotFoundError:  # pragma: no cover - handled when OCR is called.
    pytesseract = None
    TesseractNotFoundError = RuntimeError


class OcrDependencyError(RuntimeError):
    pass


logger = logging.getLogger(__name__)


async def extract_measurement_from_upload(
    file: UploadFile,
    *,
    time_zone: str,
    sent_at: str | None,
) -> MeasurementImageResponse:
    suffix = Path(file.filename or "measurement-image").suffix or ".jpg"
    with NamedTemporaryFile(suffix=suffix, delete=True) as temp:
        contents = await file.read()
        temp.write(contents)
        temp.flush()
        logger.info(
            "Upload salvo temporariamente para OCR. filename=%s content_type=%s bytes=%s temp_suffix=%s",
            file.filename,
            file.content_type,
            len(contents),
            suffix,
        )
        return extract_measurement_from_path(
            Path(temp.name),
            original_filename=file.filename or "",
            time_zone=time_zone,
            sent_at=sent_at,
        )


def extract_measurement_from_path(
    path: Path,
    *,
    original_filename: str,
    time_zone: str,
    sent_at: str | None,
) -> MeasurementImageResponse:
    logger.info(
        "Iniciando OCR da imagem. path=%s original_filename=%s time_zone=%s sent_at=%s",
        path,
        original_filename,
        time_zone,
        sent_at,
    )
    text = ocr(path)
    logger.info("OCR geral concluido. chars=%s preview=%s", len(text), preview_text(text))
    basic = extract_basic_evidence(text)
    digits_text = ocr_digits_reading(path)
    logger.info("OCR area de digitos concluido. chars=%s preview=%s", len(digits_text), preview_text(digits_text))
    digits_reading = extract_digits_reading(digits_text)
    card_text = ocr_current_card(path)
    logger.info("OCR card atual concluido. chars=%s preview=%s", len(card_text), preview_text(card_text))
    card_reading = extract_reading_from_card(card_text, text)
    current_reading = first_valid_reading(
        digits_reading,
        card_reading,
        basic["currentReadingMgDl"],
    )
    estimated_time, confidence = estimate_time_from_chart(path, basic["foundTimes"])
    filename_timestamp = timestamp_from_filename(original_filename)
    measured_at, warnings = build_measured_at(
        date_value=basic["date"],
        estimated_time=estimated_time,
        filename_timestamp=filename_timestamp,
        sent_at=sent_at,
        time_zone=time_zone,
    )

    evidence_payload = {**basic, "currentReadingMgDl": current_reading}
    evidence = MeasurementImageEvidence(
        **evidence_payload,
        estimatedReadingTime=estimated_time,
        estimatedTimeConfidence=confidence,
        whatsappFilenameTimestamp=filename_timestamp,
        sentAt=sent_at,
    )

    if current_reading is None:
        warnings.append("Nao foi possivel identificar a leitura em mg/dL.")
    elif not 40 <= current_reading <= 450:
        warnings.append("Leitura identificada fora do intervalo aceito pelo backend.")

    logger.info(
        "Evidencias extraidas. current_reading=%s digits_reading=%s card_reading=%s basic_current=%s date=%s found_times=%s found_readings=%s estimated_time=%s confidence=%s filename_timestamp=%s measured_at=%s warnings=%s",
        current_reading,
        digits_reading,
        card_reading,
        basic["currentReadingMgDl"],
        basic["date"],
        basic["foundTimes"],
        basic["foundReadingsMgDl"],
        estimated_time,
        confidence,
        filename_timestamp,
        measured_at,
        warnings,
    )

    measurement = None
    if measured_at and current_reading and 40 <= current_reading <= 450:
        moment = classify_measurement_moment(measured_at, time_zone)
        measurement = MeasurementIngestionContract(
            measuredAt=measured_at,
            glucoseValueMgDl=current_reading,
            readingContext=moment.reading_context,
            source="SENSOR",
            noteType=moment.note_type,
            timeZone=time_zone,
        )

    response = MeasurementImageResponse(ok=measurement is not None, measurement=measurement, evidence=evidence, warnings=warnings)
    logger.info(
        "Resposta OCR montada. ok=%s measurement=%s warnings=%s",
        response.ok,
        response.measurement.model_dump() if response.measurement else None,
        response.warnings,
    )
    return response


def ensure_tesseract_available() -> None:
    if pytesseract is None:
        raise OcrDependencyError("Dependencia Python ausente: instale pytesseract.")


def image_to_string(*args, **kwargs) -> str:
    ensure_tesseract_available()
    try:
        return pytesseract.image_to_string(*args, **kwargs)
    except TesseractNotFoundError as error:
        raise OcrDependencyError(
            "Binario tesseract nao encontrado. Instale com: sudo apt install tesseract-ocr tesseract-ocr-por"
        ) from error


def ocr(path: Path) -> str:
    image = Image.open(path).convert("L")
    image = image.resize((image.width * 2, image.height * 2))
    image = ImageOps.autocontrast(image)
    image = ImageEnhance.Sharpness(image).enhance(2)
    image = image.filter(ImageFilter.SHARPEN)
    return image_to_string(image, lang="por+eng", config="--psm 6")


def ocr_current_card(path: Path) -> str:
    image = Image.open(path).convert("L")
    image = image.crop((0, 0, image.width, int(image.height * 0.40)))
    image = image.resize((image.width * 2, image.height * 2))
    image = ImageOps.autocontrast(image)
    return image_to_string(image, lang="por+eng", config="--psm 6")


def ocr_digits_reading(path: Path) -> str:
    image = Image.open(path).convert("L")
    width, height = image.size
    image = image.crop((int(width * 0.24), int(height * 0.12), int(width * 0.62), int(height * 0.235)))
    image = image.resize((image.width * 4, image.height * 4))
    image = ImageOps.autocontrast(image)
    image = image.point(lambda pixel: 0 if pixel < 150 else 255)
    return image_to_string(image, config="--psm 7 -c tessedit_char_whitelist=0123456789")


def estimate_time_from_chart(path: Path, axis_times: list[str] | None = None) -> tuple[str | None, str]:
    image = cv2.imread(str(path))
    if image is None:
        return None, "baixa"
    height, width = image.shape[:2]
    x0, x1 = int(width * 0.13), int(width * 0.90)
    y0, y1 = int(height * 0.53), int(height * 0.76)
    crop = image[y0:y1, x0:x1]
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
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
    graph_left, graph_right = width * 0.135, width * 0.895
    fraction = min(1.0, max(0.0, (x0 + rightmost_x - graph_left) / (graph_right - graph_left)))
    return estimate_time_from_axis_fraction(fraction, axis_times or [])


def estimate_time_from_axis_fraction(fraction: float, axis_times: list[str]) -> tuple[str, str]:
    start_minute, end_minute, used_ocr_axis = resolve_chart_axis_minutes(axis_times)
    minutes = round((start_minute + fraction * (end_minute - start_minute)) / 5) * 5
    minutes %= 24 * 60
    hour, minute = divmod(minutes, 60)
    confidence = "media" if used_ocr_axis else "baixa"
    return f"{hour:02d}:{minute:02d}", confidence


def resolve_chart_axis_minutes(axis_times: list[str]) -> tuple[int, int, bool]:
    hourly_ticks: list[int] = []
    for value in axis_times:
        parsed = parse_time_to_minutes(value)
        if parsed is None:
            continue
        hour, minute = divmod(parsed, 60)
        if minute != 0:
            continue
        normalized = hour * 60
        if normalized not in hourly_ticks:
            hourly_ticks.append(normalized)

    if len(hourly_ticks) >= 2:
        start_minute = hourly_ticks[0]
        end_minute = hourly_ticks[-1]
        if end_minute <= start_minute:
            end_minute += 24 * 60
        return start_minute, end_minute, True

    return 11 * 60, 14 * 60, False


def parse_time_to_minutes(value: str) -> int | None:
    parts = value.split(":")
    if len(parts) != 2:
        return None
    try:
        hour = int(parts[0])
        minute = int(parts[1])
    except ValueError:
        return None
    if not (0 <= hour <= 23 and 0 <= minute <= 59):
        return None
    return hour * 60 + minute


def first_valid_reading(*readings: int | None) -> int | None:
    fallback = next((reading for reading in readings if reading is not None), None)
    return next((reading for reading in readings if reading is not None and 40 <= reading <= 450), fallback)


def preview_text(value: str, limit: int = 180) -> str:
    clean = " ".join(value.split())
    if len(clean) <= limit:
        return clean
    return f"{clean[:limit]}..."
