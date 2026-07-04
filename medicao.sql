-- Seed de medicoes de glicose para junho e julho de 2026.
-- Troque o valor abaixo pelo id do usuario desejado antes de executar.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  target_user_id uuid := 'd9a85bb2-9ec7-43c6-9650-cab0fa057b7f'::uuid;
BEGIN
  DELETE FROM measurements
  WHERE user_id = target_user_id
    AND measured_at >= DATE '2026-06-01'
    AND measured_at < DATE '2026-08-01';

  INSERT INTO measurements (
    id,
    user_id,
    measured_at,
    glucose_value_mg_dl,
    reading_context,
    note_type,
    source,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    target_user_id,
    measurement_day + measurement_time,
    FLOOR(100 + RANDOM() * 101)::int,
    reading_context::"ReadingContext",
    note_type::"MeasurementNoteType",
    'MANUAL'::"MeasurementSource",
    NOW(),
    NOW()
  FROM generate_series(
    DATE '2026-06-01',
    DATE '2026-07-31',
    INTERVAL '1 day'
  ) AS days(measurement_day)
  CROSS JOIN (
    VALUES
      (TIME '07:00', 'FASTING', 'BEFORE_BREAKFAST'),
      (TIME '09:00', 'AFTER_MEAL', 'AFTER_BREAKFAST'),
      (TIME '12:00', 'BEFORE_MEAL', 'BEFORE_LUNCH'),
      (TIME '14:00', 'AFTER_MEAL', 'AFTER_LUNCH'),
      (TIME '18:00', 'BEFORE_MEAL', 'BEFORE_DINNER'),
      (TIME '21:00', 'BEDTIME', 'AFTER_DINNER')
  ) AS readings(measurement_time, reading_context, note_type);
END $$;
