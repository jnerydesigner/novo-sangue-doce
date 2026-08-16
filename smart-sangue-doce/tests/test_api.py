from fastapi.testclient import TestClient

from app.main import app
from app.services.sibionics_ocr import OcrDependencyError


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

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
