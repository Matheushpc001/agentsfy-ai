-- Drop Google Calendar integration artifacts
DO $$ BEGIN
  ALTER TABLE profiles DROP COLUMN IF EXISTS google_calendar_token;
  ALTER TABLE profiles DROP COLUMN IF EXISTS google_calendar_refresh_token;
  ALTER TABLE profiles DROP COLUMN IF EXISTS google_calendar_email;
  ALTER TABLE appointments DROP COLUMN IF EXISTS google_event_id;
  DROP TABLE IF EXISTS google_calendar_configs CASCADE;
EXCEPTION WHEN others THEN NULL; END $$;

