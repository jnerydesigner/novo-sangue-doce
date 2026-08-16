import logging
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.schemas.measurement_image import MeasurementImageResponse
from app.services.sibionics_ocr import OcrDependencyError, extract_measurement_from_upload

router = APIRouter(prefix="/measurements", tags=["measurement-images"])
logger = logging.getLogger(__name__)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/read-image", response_model=MeasurementImageResponse)
async def read_measurement_image(
    file: Annotated[UploadFile, File(description="Print do leitor/Sibionics")],
    time_zone: Annotated[str, Form()] = "America/Manaus",
    sent_at: Annotated[str | None, Form()] = None,
) -> MeasurementImageResponse:
    logger.info(
        "Recebendo imagem para leitura. filename=%s content_type=%s time_zone=%s sent_at=%s",
        file.filename,
        file.content_type,
        time_zone,
        sent_at,
    )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        logger.warning(
            "Imagem rejeitada por content_type nao suportado. filename=%s content_type=%s",
            file.filename,
            file.content_type,
        )
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Envie uma imagem JPEG, PNG ou WEBP.",
        )

    try:
        response = await extract_measurement_from_upload(file, time_zone=time_zone, sent_at=sent_at)
        logger.info(
            "Leitura finalizada. ok=%s measurement=%s warnings=%s",
            response.ok,
            response.measurement.model_dump() if response.measurement else None,
            response.warnings,
        )
        return response
    except OcrDependencyError as error:
        logger.exception("Dependencia de OCR indisponivel.")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(error)) from error
    except ValueError as error:
        logger.exception("Imagem invalida ou nao processavel.")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error
    except Exception as error:
        logger.exception("Erro inesperado ao ler imagem.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro inesperado ao processar imagem.",
        ) from error
