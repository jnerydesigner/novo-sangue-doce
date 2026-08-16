from app.services.measurement_contract import (
    build_measured_at,
    classify_measurement_moment,
    extract_basic_evidence,
    extract_digits_reading,
    timestamp_from_filename,
)


def test_extract_basic_evidence_from_ocr_text():
    evidence = extract_basic_evidence("Atual 99 mg/dL em 10/08/2026 as 13:15. Historico 142 mg/dL")

    assert evidence["currentReadingMgDl"] == 99
    assert evidence["date"] == "10/08/2026"
    assert evidence["foundTimes"] == ["13:15"]
    assert evidence["foundReadingsMgDl"] == [99, 142]


def test_extract_digits_reading_prefers_two_or_three_digits():
    assert extract_digits_reading("abc\n101\nmg") == 101


def test_timestamp_from_whatsapp_filename():
    assert (
        timestamp_from_filename("WhatsApp Image 2026-08-10 at 13.12.40.jpeg")
        == "2026-08-10T13:12:40"
    )


def test_build_measured_at_from_date_and_estimated_time():
    measured_at, warnings = build_measured_at(
        date_value="10/08/2026",
        estimated_time="13:15",
        filename_timestamp=None,
        sent_at=None,
        time_zone="America/Manaus",
    )

    assert measured_at == "2026-08-10T13:15:00-04:00"
    assert warnings == []


def test_classify_measurement_moment_matches_nest_rules():
    moment = classify_measurement_moment("2026-08-10T13:15:00-04:00", "America/Manaus")

    assert moment.reading_context == "AFTER_MEAL"
    assert moment.note_type == "AFTER_LUNCH"
