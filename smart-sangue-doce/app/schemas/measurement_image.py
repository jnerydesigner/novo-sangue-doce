from typing import Literal

from pydantic import BaseModel, Field

ReadingContext = Literal[
    "FASTING",
    "BEFORE_MEAL",
    "AFTER_MEAL",
    "BEDTIME",
    "EXERCISE",
    "MANUAL",
    "RANDOM",
]
MeasurementSource = Literal["MANUAL", "SENSOR", "IMPORT"]
MeasurementNoteType = Literal[
    "FASTING_WAKE_UP",
    "BEFORE_BREAKFAST",
    "AFTER_BREAKFAST",
    "MORNING_RANDOM_CHECK",
    "BEFORE_LUNCH",
    "AFTER_LUNCH",
    "AFTERNOON_RANDOM_CHECK",
    "BEFORE_DINNER",
    "AFTER_DINNER",
    "BEFORE_SLEEP",
    "NIGHT_RANDOM_CHECK",
    "BEFORE_EXERCISE",
    "AFTER_EXERCISE",
    "FEELING_UNWELL",
    "ROUTINE_CHECK",
    "DAWN_RANDOM_CHECK",
]


class MeasurementIngestionContract(BaseModel):
    measuredAt: str = Field(description="ISO datetime aceito pelo NestJS.")
    glucoseValueMgDl: int = Field(ge=40, le=450)
    readingContext: ReadingContext
    source: MeasurementSource = "SENSOR"
    noteType: MeasurementNoteType
    timeZone: str = "America/Manaus"


class MeasurementImageEvidence(BaseModel):
    currentReadingMgDl: int | None = None
    date: str | None = None
    estimatedReadingTime: str | None = None
    estimatedTimeConfidence: Literal["baixa", "media", "alta"] = "baixa"
    whatsappFilenameTimestamp: str | None = None
    sentAt: str | None = None
    foundTimes: list[str] = Field(default_factory=list)
    foundReadingsMgDl: list[int] = Field(default_factory=list)
    ocrText: str = ""


class MeasurementImageResponse(BaseModel):
    ok: bool
    measurement: MeasurementIngestionContract | None
    evidence: MeasurementImageEvidence
    warnings: list[str] = Field(default_factory=list)
