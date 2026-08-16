import re
from dataclasses import dataclass
from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

DATE = r"(?:0?[1-9]|[12]\d|3[01])[/.-](?:0?[1-9]|1[0-2])[/.-](?:20)?\d{2}"
TIME = r"(?:[01]?\d|2[0-3])[:h][0-5]\d"


@dataclass(frozen=True)
class ClassifiedMoment:
    reading_context: str
    note_type: str


MOMENT_RULES: tuple[tuple[int, int, ClassifiedMoment], ...] = (
    (0, 359, ClassifiedMoment("RANDOM", "DAWN_RANDOM_CHECK")),
    (360, 479, ClassifiedMoment("BEFORE_MEAL", "BEFORE_BREAKFAST")),
    (480, 659, ClassifiedMoment("AFTER_MEAL", "AFTER_BREAKFAST")),
    (660, 749, ClassifiedMoment("BEFORE_MEAL", "BEFORE_LUNCH")),
    (750, 839, ClassifiedMoment("AFTER_MEAL", "AFTER_LUNCH")),
    (840, 1079, ClassifiedMoment("RANDOM", "AFTERNOON_RANDOM_CHECK")),
    (1080, 1199, ClassifiedMoment("BEFORE_MEAL", "BEFORE_DINNER")),
    (1200, 1439, ClassifiedMoment("BEDTIME", "BEFORE_SLEEP")),
)


def normalize_ocr_text(text: str) -> str:
    return re.sub(r"[ \t]+", " ", text)


def extract_basic_evidence(text: str) -> dict:
    clean = normalize_ocr_text(text)
    readings = [int(value) for value in re.findall(rf"\b(\d{{2,3}})\s*mg\s*/?\s*dL\b", clean, re.I)]
    dates = re.findall(rf"({DATE})", clean, re.I)
    times = re.findall(rf"({TIME})", clean, re.I)
    return {
        "currentReadingMgDl": readings[0] if readings else None,
        "date": normalize_date(dates[0]) if dates else None,
        "foundTimes": [time.replace("h", ":") for time in times],
        "foundReadingsMgDl": readings,
        "ocrText": text.strip(),
    }


def extract_reading_from_card(card_text: str, full_text: str) -> int | None:
    for text in (card_text, full_text):
        readings = re.findall(r"\b(\d{2,3})\s*mg\s*/?\s*dL\b", text, re.I)
        if readings:
            return int(readings[0])
    return None


def extract_digits_reading(text: str) -> int | None:
    values = re.findall(r"\b\d{2,3}\b", text)
    return int(values[0]) if values else None


def timestamp_from_filename(filename: str) -> str | None:
    match = re.search(r"(20\d{2})[-.](\d{2})[-.](\d{2}).*?(\d{2})[.:](\d{2})[.:](\d{2})", filename)
    if not match:
        return None
    return datetime.strptime("".join(match.groups()), "%Y%m%d%H%M%S").isoformat()


def normalize_date(value: str) -> str:
    parts = re.split(r"[/.-]", value)
    day, month, year = parts
    year = f"20{year}" if len(year) == 2 else year
    return f"{int(day):02d}/{int(month):02d}/{year}"


def parse_date_br(value: str) -> tuple[int, int, int]:
    day, month, year = normalize_date(value).split("/")
    return int(year), int(month), int(day)


def build_measured_at(
    *,
    date_value: str | None,
    estimated_time: str | None,
    filename_timestamp: str | None,
    sent_at: str | None,
    time_zone: str,
) -> tuple[str | None, list[str]]:
    warnings: list[str] = []
    tz = parse_time_zone(time_zone)

    if date_value and estimated_time:
        year, month, day = parse_date_br(date_value)
        hour, minute = (int(part) for part in estimated_time.split(":")[:2])
        return datetime(year, month, day, hour, minute, tzinfo=tz).isoformat(), warnings

    if sent_at:
        parsed = parse_iso_datetime(sent_at, time_zone)
        warnings.append("Horario da leitura nao encontrado; usando sent_at como fallback.")
        return parsed.isoformat(), warnings

    if filename_timestamp:
        parsed = parse_iso_datetime(filename_timestamp, time_zone)
        warnings.append("Horario da leitura nao encontrado; usando timestamp do nome do arquivo.")
        return parsed.isoformat(), warnings

    warnings.append("Nao foi possivel montar measuredAt sem data/horario, sent_at ou timestamp no nome.")
    return None, warnings


def classify_measurement_moment(measured_at: str, time_zone: str) -> ClassifiedMoment:
    tz = parse_time_zone(time_zone)
    dt = parse_iso_datetime(measured_at, time_zone).astimezone(tz)
    measured_minute = dt.hour * 60 + dt.minute
    for start, end, moment in MOMENT_RULES:
        if start <= measured_minute <= end:
            return moment
    return ClassifiedMoment("RANDOM", "ROUTINE_CHECK")


def parse_iso_datetime(value: str, time_zone: str) -> datetime:
    normalized = value.replace("Z", "+00:00")
    parsed = datetime.fromisoformat(normalized)
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=parse_time_zone(time_zone))
    return parsed


def parse_time_zone(value: str) -> ZoneInfo:
    try:
        return ZoneInfo(value)
    except ZoneInfoNotFoundError as error:
        raise ValueError(f"Time zone invalida: {value}") from error
