from pathlib import Path

from app.services import sibionics_ocr


def test_extract_measurement_from_path_builds_evidence_without_duplicate_fields(monkeypatch, tmp_path):
    image = tmp_path / "WhatsApp Image 2026-08-10 at 13.12.40.jpeg"
    image.write_bytes(b"fake-image")

    monkeypatch.setattr(
        sibionics_ocr,
        "ocr",
        lambda path: "Atual 99 mg/dL em 10/08/2026 as 13:15",
    )
    monkeypatch.setattr(sibionics_ocr, "ocr_digits_reading", lambda path: "99")
    monkeypatch.setattr(sibionics_ocr, "ocr_current_card", lambda path: "99 mg/dL")
    monkeypatch.setattr(
        sibionics_ocr,
        "estimate_time_from_chart",
        lambda path, axis_times: ("13:15", "media"),
    )

    response = sibionics_ocr.extract_measurement_from_path(
        Path(image),
        original_filename=image.name,
        time_zone="America/Manaus",
        sent_at=None,
    )

    assert response.ok is True
    assert response.evidence.currentReadingMgDl == 99
    assert response.measurement is not None
    assert response.measurement.glucoseValueMgDl == 99
    assert response.measurement.measuredAt == "2026-08-10T13:15:00-04:00"


def test_estimate_time_from_axis_fraction_uses_ocr_chart_ticks():
    estimated_time, confidence = sibionics_ocr.estimate_time_from_axis_fraction(
        0.95,
        ["07:00", "08:00", "09:00", "10:00", "07:08", "09:03"],
    )

    assert estimated_time == "09:50"
    assert confidence == "media"


def test_estimate_time_from_axis_fraction_falls_back_when_axis_is_missing():
    estimated_time, confidence = sibionics_ocr.estimate_time_from_axis_fraction(0.50, ["07:08"])

    assert estimated_time == "12:30"
    assert confidence == "baixa"


def test_first_valid_reading_ignores_invalid_digits_when_card_is_valid():
    assert sibionics_ocr.first_valid_reading(15, 169, 169) == 169


def test_aidex_uses_chart_time_and_warns_when_date_is_inferred(monkeypatch, tmp_path):
    image = tmp_path / "aidex.png"
    image.write_bytes(b"fake-image")
    monkeypatch.setattr(sibionics_ocr, "ocr", lambda path: "124 mg/dL Há 1 minutos\nRestam 11 dias")
    monkeypatch.setattr(sibionics_ocr.aidex_ocr, "read_digits", lambda path, ocr: 124)
    monkeypatch.setattr(sibionics_ocr, "ocr_current_card", lambda path: "124 mg/dL")
    monkeypatch.setattr(sibionics_ocr.aidex_ocr, "estimate_chart_time", lambda path, ocr: ("15:22", "media"))

    response = sibionics_ocr.extract_measurement_from_path(
        image, original_filename=image.name, time_zone="America/Manaus", sent_at="2026-11-18T19:23:00Z"
    )

    assert response.measurement.glucoseValueMgDl == 124
    assert response.measurement.measuredAt == "2026-11-18T15:22:00-04:00"
    assert response.evidence.estimatedReadingTime == "15:22"
    assert any("data do envio" in warning for warning in response.warnings)


def test_aidex_detection_requires_both_screen_labels():
    assert sibionics_ocr.aidex_ocr.is_aidex("Há 1 minutos\nRestam 11 dias")
    assert not sibionics_ocr.aidex_ocr.is_aidex("Há 1 minutos\n99 mg/dL")
