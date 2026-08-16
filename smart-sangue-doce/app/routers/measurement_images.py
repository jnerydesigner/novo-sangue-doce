from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.schemas.measurement_image import MeasurementImageResponse
from app.services.sibionics_ocr import OcrDependencyError, extract_measurement_from_upload

router = APIRouter(prefix="/measurements", tags=["measurement-images"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/read-image", response_model=MeasurementImageResponse)
async def read_measurement_image(
    file: Annotated[UploadFile, File(description="Print do leitor/Sibionics")],
    time_zone: Annotated[str, Form()] = "America/Manaus",
    sent_at: Annotated[str | None, Form()] = None,
) -> MeasurementImageResponse:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Envie uma imagem JPEG, PNG ou WEBP.",
        )

    try:
        return await extract_measurement_from_upload(file, time_zone=time_zone, sent_at=sent_at)
    except OcrDependencyError as error:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error
