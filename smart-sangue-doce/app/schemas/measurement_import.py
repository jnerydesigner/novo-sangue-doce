from pydantic import BaseModel, Field


class ImportedMeasurement(BaseModel):
    measured_at: str
    glucose_value_mg_dl: int = Field(ge=40, le=450)


class MeasurementImportResponse(BaseModel):
    ok: bool
    count: int
    user_id: str
    measurements: list[ImportedMeasurement]
    warnings: list[str] = Field(default_factory=list)
