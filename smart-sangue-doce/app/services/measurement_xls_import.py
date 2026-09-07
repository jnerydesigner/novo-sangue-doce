from io import BytesIO
from typing import Callable

import pandas as pd

from app.schemas.measurement_import import ImportedMeasurement

COLUMN_MAPPING = {
    "Hora": "measured_at",
    "Leitura de sensor(mg/dL)": "glucose_value_mg_dl",
}
EXPECTED_COLUMNS = ["measured_at", "glucose_value_mg_dl"]


def _read_xls(file_content: bytes) -> tuple[pd.DataFrame, list[str]]:
    stripped_content = file_content.lstrip()
    readers: list[tuple[str, Callable[[], pd.DataFrame]]] = []

    if file_content.startswith(b"PK"):
        readers.append(("xlsx", lambda: pd.read_excel(BytesIO(file_content), engine="openpyxl")))
    if file_content.startswith(b"\xd0\xcf\x11\xe0"):
        readers.append(("xls", lambda: pd.read_excel(BytesIO(file_content), engine="xlrd")))
    if stripped_content.startswith((b"<", b"\xef\xbb\xbf<")):
        readers.append(("html", lambda: pd.read_html(BytesIO(file_content))[0]))

    readers.extend(
        [
            ("xls", lambda: pd.read_excel(BytesIO(file_content), engine="xlrd")),
            ("xlsx", lambda: pd.read_excel(BytesIO(file_content), engine="openpyxl")),
            ("html", lambda: pd.read_html(BytesIO(file_content))[0]),
        ]
    )
    errors: list[str] = []
    tried_readers: set[str] = set()

    for reader_name, reader in readers:
        if reader_name in tried_readers:
            continue
        tried_readers.add(reader_name)
        try:
            df = reader()
            warnings = []
            if reader_name == "html":
                warnings.append("Arquivo .xls lido como HTML exportado pelo Excel.")
            if reader_name == "xlsx":
                warnings.append("Arquivo enviado como .xls, mas lido como XLSX.")
            return df, warnings
        except Exception as error:
            errors.append(f"{reader_name}: {type(error).__name__}: {error}")

    raise ValueError(
        "Nao foi possivel ler o arquivo XLS. "
        "Confirme se ele abre no Excel/LibreOffice e se contem uma tabela com as colunas esperadas. "
        f"Tentativas: {' | '.join(errors)}"
    )


def import_measurements_from_xls(file_content: bytes) -> tuple[list[ImportedMeasurement], list[str]]:
    df, warnings = _read_xls(file_content)

    mapped_df = df.rename(columns=COLUMN_MAPPING).copy()
    missing_columns = [column for column in EXPECTED_COLUMNS if column not in mapped_df.columns]
    if missing_columns:
        raise ValueError(f"Colunas ausentes no XLS: {', '.join(missing_columns)}.")

    mapped_df = mapped_df[EXPECTED_COLUMNS]
    mapped_df["measured_at"] = (
        mapped_df["measured_at"]
        .astype(str)
        .str.strip()
        .str.replace(r"\s+GMT[+-]\d{1,2}$", "", regex=True)
    )
    mapped_df["measured_at"] = pd.to_datetime(
        mapped_df["measured_at"],
        format="%d-%m-%Y %H:%M",
        errors="coerce",
    )
    mapped_df["glucose_value_mg_dl"] = pd.to_numeric(
        mapped_df["glucose_value_mg_dl"],
        errors="coerce",
    )

    invalid_rows = mapped_df[
        mapped_df["measured_at"].isna() | mapped_df["glucose_value_mg_dl"].isna()
    ]
    if not invalid_rows.empty:
        row_numbers = [str(index + 2) for index in invalid_rows.index[:10]]
        raise ValueError(f"Linhas invalidas no XLS: {', '.join(row_numbers)}.")

    mapped_df["measured_at"] = mapped_df["measured_at"].dt.strftime("%Y-%m-%d %H:%M:%S.000")
    mapped_df["glucose_value_mg_dl"] = mapped_df["glucose_value_mg_dl"].astype(int)

    records = [
        ImportedMeasurement(**record)
        for record in mapped_df.to_dict(orient="records")
    ]
    return records, warnings
