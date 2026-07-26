/*
# Rebuild law-firm schema with BIGINT IDs + lawyers table (retry, idempotent)

1. Overview
Rebuilds the law-firm schema with BIGINT auto-incrementing integer IDs (was UUID),
adds a `lawyers` table, and expands clients/cases/events with law-firm fields.
The existing tables held only test rows (2 clients, 4 cases, 6 events); owner
authorized the rebuild. Idempotent: safe to re-run.

2. New tables — see columns in SQL below
- lawyers  (id bigint identity PK, name, email, phone, specialization, bar_number, status, notes, created_at)
- clients  (id bigint identity PK, name, email, phone, company, national_id, address, client_type, status, notes, created_at)
- cases    (id bigint identity PK, client_id->clients, lawyer_id->lawyers, title, case_number, court, case_type, status, filed_date, next_hearing_date, notes, created_at)
- events   (id bigint identity PK, case_id->cases, lawyer_id->lawyers, title, event_date, event_time, location, event_type, status, notes, created_at)

3. Security (RLS)
Single-tenant, no auth screen. RLS enabled on all tables; full CRUD to
anon, authenticated (USING (true)) — intentionally shared office data.

4. Notes
- All id / *_id fields are numbers (bigint).
- ON DELETE CASCADE: client -> cases -> events; deleting a lawyer sets
  case/event lawyer_id to NULL.
*/

DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS lawyers CASCADE;

CREATE TABLE lawyers (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name           text NOT NULL,
  email          text,
  phone          text,
  specialization text,
  bar_number     text,
  status         text NOT NULL DEFAULT 'Active',
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE clients (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        text NOT NULL,
  email       text,
  phone       text,
  company     text,
  national_id text,
  address     text,
  client_type text NOT NULL DEFAULT 'Individual',
  status      text NOT NULL DEFAULT 'Active',
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cases (
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id         bigint NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  lawyer_id         bigint REFERENCES lawyers(id) ON DELETE SET NULL,
  title             text NOT NULL,
  case_number       text,
  court             text,
  case_type         text NOT NULL DEFAULT 'Civil',
  status            text NOT NULL DEFAULT 'Open',
  filed_date        date,
  next_hearing_date date,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE events (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_id    bigint NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  lawyer_id  bigint REFERENCES lawyers(id) ON DELETE SET NULL,
  title      text NOT NULL,
  event_date date NOT NULL,
  event_time time,
  location   text,
  event_type text NOT NULL DEFAULT 'Hearing',
  status     text NOT NULL DEFAULT 'Scheduled',
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX cases_client_id_idx   ON cases(client_id);
CREATE INDEX cases_lawyer_id_idx   ON cases(lawyer_id);
CREATE INDEX cases_status_idx      ON cases(status);
CREATE INDEX events_case_id_idx    ON events(case_id);
CREATE INDEX events_lawyer_id_idx  ON events(lawyer_id);
CREATE INDEX events_event_date_idx ON events(event_date);
CREATE INDEX events_status_idx     ON events(status);
CREATE INDEX lawyers_status_idx    ON lawyers(status);

ALTER TABLE lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases   ENABLE ROW LEVEL SECURITY;
ALTER TABLE events  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_lawyers" ON lawyers;
CREATE POLICY "anon_select_lawyers" ON lawyers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_lawyers" ON lawyers;
CREATE POLICY "anon_insert_lawyers" ON lawyers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_lawyers" ON lawyers;
CREATE POLICY "anon_update_lawyers" ON lawyers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_lawyers" ON lawyers;
CREATE POLICY "anon_delete_lawyers" ON lawyers FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_clients" ON clients;
CREATE POLICY "anon_select_clients" ON clients FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_clients" ON clients;
CREATE POLICY "anon_insert_clients" ON clients FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_clients" ON clients;
CREATE POLICY "anon_update_clients" ON clients FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_clients" ON clients;
CREATE POLICY "anon_delete_clients" ON clients FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_cases" ON cases;
CREATE POLICY "anon_select_cases" ON cases FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_cases" ON cases;
CREATE POLICY "anon_insert_cases" ON cases FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_cases" ON cases;
CREATE POLICY "anon_update_cases" ON cases FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_cases" ON cases;
CREATE POLICY "anon_delete_cases" ON cases FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_events" ON events;
CREATE POLICY "anon_select_events" ON events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_events" ON events;
CREATE POLICY "anon_insert_events" ON events FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_events" ON events;
CREATE POLICY "anon_update_events" ON events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_events" ON events;
CREATE POLICY "anon_delete_events" ON events FOR DELETE TO anon, authenticated USING (true);
