-- Run once in the Neon SQL editor (or: psql "$DATABASE_URL" -f db/schema.sql)

CREATE TABLE IF NOT EXISTS site_stats (
  key   text   PRIMARY KEY,
  value bigint NOT NULL DEFAULT 0
);

-- Salted, daily-rotating hash only. No raw IPs, no user agents.
CREATE TABLE IF NOT EXISTS visit_dedupe (
  h   text NOT NULL,
  day date NOT NULL DEFAULT current_date,
  PRIMARY KEY (h, day)
);
CREATE INDEX IF NOT EXISTS visit_dedupe_day_idx ON visit_dedupe (day);

INSERT INTO site_stats (key, value) VALUES ('total_visits', 0) ON CONFLICT (key) DO NOTHING;

-- Join / contact form submissions (read these in the Neon console or via your own admin tool).
CREATE TABLE IF NOT EXISTS join_requests (
  id         bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  name       text NOT NULL,
  email      text NOT NULL,
  interest   text,
  message    text NOT NULL,
  ip_hash    text NOT NULL
);
CREATE INDEX IF NOT EXISTS join_requests_ip_idx ON join_requests (ip_hash, created_at);

-- First-party CMS content. Keep site settings as the fixed `main` document.
CREATE TABLE IF NOT EXISTS cms_documents (
  collection text NOT NULL CHECK (collection IN ('settings', 'team', 'events', 'projects', 'announcements')),
  id         text NOT NULL,
  data       jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection, id),
  CHECK (collection <> 'settings' OR id = 'main')
);
CREATE UNIQUE INDEX IF NOT EXISTS cms_announcement_slug_idx
  ON cms_documents ((data->>'slug'))
  WHERE collection = 'announcements';
