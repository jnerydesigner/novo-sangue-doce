from collections.abc import Callable

from app.schemas.measurement_import import ImportedMeasurement
from app.services.measurement_xls_import import import_measurements_from_xls

ReportDecoder = Callable[[bytes], tuple[list[ImportedMeasurement], list[str]]]

SENSOR_MANUFACTURER_DECODERS: dict[str, ReportDecoder] = {
    "Sibionics": import_measurements_from_xls,
    "Other": import_measurements_from_xls,
}


def get_report_decoder(sensor_manufacturer: str) -> ReportDecoder:
    try:
        return SENSOR_MANUFACTURER_DECODERS[sensor_manufacturer]
    except KeyError as error:
        supported = ", ".join(sorted(SENSOR_MANUFACTURER_DECODERS))
        raise ValueError(
            f"Fabricante de sensor nao suportado: {sensor_manufacturer}. Suportados: {supported}."
        ) from error
