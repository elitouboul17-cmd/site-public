import type { Sql } from "./sql";

/**
 * Schéma versionné. Chaque migration est idempotente et appliquée une seule fois
 * (table `schema_migrations`). Ajouter une migration = ajouter une entrée au tableau.
 * Le même SQL est valide pour SQLite et PostgreSQL.
 */
const MIGRATIONS: { id: number; sql: string }[] = [
  {
    id: 1,
    sql: `
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_tier TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  summary_lang TEXT NOT NULL,
  summary_kind TEXT NOT NULL,
  original_excerpt TEXT,
  image_url TEXT,
  published_at TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  last_checked_at TEXT NOT NULL,
  updated_at TEXT,
  revision INTEGER NOT NULL DEFAULT 1,
  reliability TEXT NOT NULL,
  reliability_reason TEXT NOT NULL,
  categories TEXT NOT NULL,
  production_ids TEXT NOT NULL,
  character_ids TEXT NOT NULL,
  cluster_id TEXT NOT NULL,
  is_trailer INTEGER NOT NULL DEFAULT 0,
  content_hash TEXT NOT NULL,
  youtube_id TEXT,
  title_fingerprint TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles (published_at);
CREATE INDEX IF NOT EXISTS idx_articles_cluster ON articles (cluster_id);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles (source_id);

CREATE TABLE IF NOT EXISTS ingestion_runs (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  trigger TEXT NOT NULL,
  status TEXT NOT NULL,
  stats TEXT NOT NULL,
  log TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_runs_started ON ingestion_runs (started_at);

CREATE TABLE IF NOT EXISTS source_health (
  source_id TEXT PRIMARY KEY,
  last_attempt_at TEXT,
  last_success_at TEXT,
  last_error TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  etag TEXT,
  last_modified TEXT,
  last_item_count INTEGER
);

CREATE TABLE IF NOT EXISTS production_media (
  production_id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_id TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  provider_release_date TEXT,
  provider_runtime INTEGER,
  fetched_at TEXT NOT NULL
);
`,
  },
];

export async function migrate(sql: Sql) {
  await sql.exec(
    "CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);",
  );
  const rows = await sql.all<{ id: number }>("SELECT id FROM schema_migrations");
  const done = new Set(rows.map((r) => Number(r.id)));
  for (const m of MIGRATIONS) {
    if (done.has(m.id)) continue;
    await sql.exec(m.sql);
    await sql.run("INSERT INTO schema_migrations (id, applied_at) VALUES ($1, $2)", [m.id, new Date().toISOString()]);
  }
}
