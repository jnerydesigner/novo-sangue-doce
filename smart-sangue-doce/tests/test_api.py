from io import BytesIO

import pandas as pd
import xlwt
from fastapi.testclient import TestClient

from app.main import app
from app.services.sibionics_ocr import OcrDependencyError


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "smart-sangue-doce"}


def test_read_image_rejects_unsupported_content_type():
    response = client.post(
        "/v1/measurements/read-image",
        files={"file": ("reading.txt", b"not an image", "text/plain")},
    )

    assert response.status_code == 415


def test_read_image_returns_503_when_ocr_dependency_is_missing(monkeypatch):
    async def fake_extract(*args, **kwargs):
        raise OcrDependencyError("Binario tesseract nao encontrado.")

    monkeypatch.setattr("app.routers.measurement_images.extract_measurement_from_upload", fake_extract)

    response = client.post(
        "/v1/measurements/read-image",
        files={"file": ("reading.png", b"fake-image", "image/png")},
    )

    assert response.status_code == 503
    assert response.json() == {"detail": "Binario tesseract nao encontrado."}


def test_import_xls_returns_measurements_json():
    excel_buffer = BytesIO()
    workbook = xlwt.Workbook()
    sheet = workbook.add_sheet("Sheet1")
    rows = [
        ["Hora", "Leitura de sensor(mg/dL)"],
        ["03-09-2026 14:02 GMT-4", 153],
        ["03-09-2026 14:07 GMT-4", 147],
    ]
    for row_index, row in enumerate(rows):
        for column_index, value in enumerate(row):
            sheet.write(row_index, column_index, value)
    workbook.save(excel_buffer)

    response = client.post(
        "/v1/measurements/import-xls",
        data={"user_id": "user-123", "sensor_manufacturer": "Sibionics"},
        files={
            "file": (
                "relatorio.xls",
                excel_buffer.getvalue(),
                "application/vnd.ms-excel",
            )
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "ok": True,
        "count": 2,
        "user_id": "user-123",
        "measurements": [
            {"measured_at": "2026-09-03 14:02:00.000", "glucose_value_mg_dl": 153},
            {"measured_at": "2026-09-03 14:07:00.000", "glucose_value_mg_dl": 147},
        ],
        "warnings": [],
    }


def test_import_xls_reads_html_excel_export():
    html_excel = b"""
    <table>
      <tr><th>Hora</th><th>Leitura de sensor(mg/dL)</th></tr>
      <tr><td>03-09-2026 14:02 GMT-4</td><td>153</td></tr>
    </table>
    """

    response = client.post(
        "/v1/measurements/import-xls",
        data={"user_id": "user-123"},
        files={
            "file": (
                "relatorio.xls",
                html_excel,
                "application/vnd.ms-excel",
            )
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "ok": True,
        "count": 1,
        "user_id": "user-123",
        "measurements": [
            {"measured_at": "2026-09-03 14:02:00.000", "glucose_value_mg_dl": 153},
        ],
        "warnings": ["Arquivo .xls lido como HTML exportado pelo Excel."],
    }


def test_import_xls_reads_xlsx_content_with_xls_extension():
    excel_buffer = BytesIO()
    pd.DataFrame(
        {
            "Hora": ["03-09-2026 14:02 GMT-4"],
            "Leitura de sensor(mg/dL)": [153],
        }
    ).to_excel(excel_buffer, index=False)

    response = client.post(
        "/v1/measurements/import-xls",
        data={"user_id": "user-123"},
        files={
            "file": (
                "relatorio.xls",
                excel_buffer.getvalue(),
                "application/vnd.ms-excel",
            )
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "ok": True,
        "count": 1,
        "user_id": "user-123",
        "measurements": [
            {"measured_at": "2026-09-03 14:02:00.000", "glucose_value_mg_dl": 153},
        ],
        "warnings": ["Arquivo enviado como .xls, mas lido como XLSX."],
    }


def test_import_xls_rejects_unsupported_content_type():
    response = client.post(
        "/v1/measurements/import-xls",
        data={"user_id": "user-123"},
        files={"file": ("relatorio.txt", b"not excel", "text/plain")},
    )

    assert response.status_code == 415


def test_import_xls_rejects_unsupported_sensor_manufacturer():
    response = client.post(
        "/v1/measurements/import-xls",
        data={"user_id": "user-123", "sensor_manufacturer": "Dexcom"},
        files={"file": ("relatorio.xls", b"fake excel", "application/vnd.ms-excel")},
    )

    assert response.status_code == 422
    assert response.json() == {
        "detail": "Fabricante de sensor nao suportado: Dexcom. Suportados: Sibionics."
    }
