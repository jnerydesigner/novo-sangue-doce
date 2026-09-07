import logging
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.schemas.measurement_import import MeasurementImportResponse
from app.services.report_decoder_factory import get_report_decoder

router = APIRouter(prefix="/measurements", tags=["measurement-imports"])
logger = logging.getLogger(__name__)

ALLOWED_CONTENT_TYPES = {
    "application/vnd.ms-excel",
    "application/octet-stream",
}


@router.post("/import-xls", response_model=MeasurementImportResponse)
async def import_measurements_xls(
    file: Annotated[UploadFile, File(description="Relatorio XLS de glicose")],
    user_id: Annotated[str, Form(description="ID do usuario que esta importando o arquivo")],
    sensor_manufacturer: Annotated[
        str,
        Form(description="Fabricante do sensor que gerou o relatorio"),
    ] = "Sibionics",
) -> MeasurementImportResponse:
    logger.info(
        "Recebendo XLS para importacao. filename=%s content_type=%s user_id=%s sensor_manufacturer=%s",
        file.filename,
        file.content_type,
        user_id,
        sensor_manufacturer,
    )

    if file.content_type not in ALLOWED_CONTENT_TYPES and not file.filename.lower().endswith(".xls"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Envie um arquivo XLS.",
        )

    try:
        decoder = get_report_decoder(sensor_manufacturer)
        measurements, warnings = decoder(await file.read())
    except ValueError as error:
        logger.exception("XLS invalido ou nao processavel.")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error
    except Exception as error:
        logger.exception("Erro inesperado ao importar XLS.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro inesperado ao importar XLS.",
        ) from error

    return MeasurementImportResponse(
        ok=True,
        count=len(measurements),
        user_id=user_id,
        measurements=measurements,
        warnings=warnings,
    )
