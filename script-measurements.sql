-- Popula medições locais para testar o relatório mensal de glicemia de julho/2026.
-- Uso sugerido:
--   PGPASSWORD=postgres psql -h localhost -U postgres -d sangue_doce -f script-measurements.sql
--
-- Ajuste o email abaixo caso queira popular outro usuário local.

DO $$
DECLARE
  report_user_email text := 'jander.webmaster@gmail.com';
  report_user_id uuid;
  slot record;
  reading record;
  measured_at_value timestamptz;
  measurement_id uuid;
BEGIN
  SELECT id INTO report_user_id
  FROM users
  WHERE email = report_user_email;

  IF report_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario % nao encontrado. Rode o seed de usuarios ou altere report_user_email.', report_user_email;
  END IF;

  UPDATE users
  SET
    birth_date = TIMESTAMPTZ '1978-01-23 00:00:00+00',
    diabetes_type = 'TYPE_1'::"DiabetesType",
    updated_at = NOW()
  WHERE id = report_user_id;

  -- Remove apenas as leituras importadas desse periodo para manter o script reexecutavel.
  DELETE FROM measurements
  WHERE user_id = report_user_id
    AND source = 'IMPORT'::"MeasurementSource"
    AND measured_at >= TIMESTAMPTZ '2026-07-01 00:00:00+00'
    AND measured_at < TIMESTAMPTZ '2026-08-02 00:00:00+00';

  FOR reading IN
    SELECT *
    FROM (VALUES
      (DATE '2026-07-08', 218, 223, 219, 216, 353, 189),
      (DATE '2026-07-09', 323, 264, 230, 170, 432, 456),
      (DATE '2026-07-10', 154, 129, 162, 102, 134, 138),
      (DATE '2026-07-11', 187, 186,  98, 243, 430, 157),
      (DATE '2026-07-12', 227, 304, 377, 142, 118, 187),
      (DATE '2026-07-13', 306, 192, 173, 160, 372, 101),
      (DATE '2026-07-14', 300, 195, 196, 200, 300, 140),
      (DATE '2026-07-15', 307, 245, 197,  77, 275, 346),
      (DATE '2026-07-16', 319, 223, 197, 198, 109, 181),
      (DATE '2026-07-17',  82, 139, 190, 190, 107, 190),
      (DATE '2026-07-18', 222, 290, 291, 286, 168, 111),
      (DATE '2026-07-19', 267, 207, 259, 143, 122, 126),
      (DATE '2026-07-20', 266, 276, 240, 143, 180, 168),
      (DATE '2026-07-21', 304, 272, 259, 289, 339, 171),
      (DATE '2026-07-22', 231, 255, 168, 196, 114, 142),
      (DATE '2026-07-23', 100, 194, 118, 105, 115, 130),
      (DATE '2026-07-24', 145, 180, 164, 198, 154, 117),
      (DATE '2026-07-25', 108, 134, 127, 139, 182, 147),
      (DATE '2026-07-26', 152, 126, 176, 177, 111, 110),
      (DATE '2026-07-27', 179, 132, 148, 172, 116, 111),
      (DATE '2026-07-28', 171, 117, 116, 158, 154, 155),
      (DATE '2026-07-29', 160, 161, 171, 185, 147, 133),
      (DATE '2026-07-30', 182, 107, 109, 116, 160, 182),
      (DATE '2026-07-31', 102, 152, 196, 179, 145, 163)
    ) AS v(day_date, before_breakfast, after_breakfast, before_lunch, after_lunch, before_dinner, after_dinner)
  LOOP
    FOR slot IN
      SELECT *
      FROM (VALUES
        (1,  6, 45, 'BEFORE_BREAKFAST', 'BEFORE_MEAL', reading.before_breakfast),
        (2,  9, 10, 'AFTER_BREAKFAST',  'AFTER_MEAL',  reading.after_breakfast),
        (3, 11, 35, 'BEFORE_LUNCH',     'BEFORE_MEAL', reading.before_lunch),
        (4, 13, 20, 'AFTER_LUNCH',      'AFTER_MEAL',  reading.after_lunch),
        (5, 18, 25, 'BEFORE_DINNER',    'BEFORE_MEAL', reading.before_dinner),
        (6, 21, 40, 'AFTER_DINNER',     'BEDTIME',     reading.after_dinner)
      ) AS s(slot_index, hour_value, minute_value, note_type_value, reading_context_value, glucose_value)
    LOOP
      measured_at_value := MAKE_TIMESTAMPTZ(
        EXTRACT(YEAR FROM reading.day_date)::int,
        EXTRACT(MONTH FROM reading.day_date)::int,
        EXTRACT(DAY FROM reading.day_date)::int,
        slot.hour_value,
        slot.minute_value,
        0,
        'America/Manaus'
      );

      measurement_id := (
        SUBSTR(MD5('report-local:' || report_user_id || ':' || measured_at_value::text || ':' || slot.note_type_value), 1, 8) || '-' ||
        SUBSTR(MD5('report-local:' || report_user_id || ':' || measured_at_value::text || ':' || slot.note_type_value), 9, 4) || '-' ||
        SUBSTR(MD5('report-local:' || report_user_id || ':' || measured_at_value::text || ':' || slot.note_type_value), 13, 4) || '-' ||
        SUBSTR(MD5('report-local:' || report_user_id || ':' || measured_at_value::text || ':' || slot.note_type_value), 17, 4) || '-' ||
        SUBSTR(MD5('report-local:' || report_user_id || ':' || measured_at_value::text || ':' || slot.note_type_value), 21, 12)
      )::uuid;

      INSERT INTO measurements (
        id,
        user_id,
        measured_at,
        glucose_value_mg_dl,
        reading_context,
        source,
        note_type,
        created_at,
        updated_at
      ) VALUES (
        measurement_id,
        report_user_id,
        measured_at_value,
        slot.glucose_value,
        slot.reading_context_value::"ReadingContext",
        'IMPORT'::"MeasurementSource",
        slot.note_type_value::"MeasurementNoteType",
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        measured_at = EXCLUDED.measured_at,
        glucose_value_mg_dl = EXCLUDED.glucose_value_mg_dl,
        reading_context = EXCLUDED.reading_context,
        source = EXCLUDED.source,
        note_type = EXCLUDED.note_type,
        updated_at = NOW();
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Relatorio local populado: 144 medicoes para % em julho/2026.', report_user_email;
END $$;
