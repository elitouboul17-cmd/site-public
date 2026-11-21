import { getSql } from "./sql";
import type { Article, IngestionRun, NewsCategory, Reliability, SourceHealth } from "../types";

/* ───────────── Articles ───────────── */

type ArticleRow = Record<string, unknown>;

function parseList(v: unknown): string[] {
  if (typeof v !== "string" || !v) return [];
  try {
    const p = JSON.parse(v);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function rowToArticle(r: ArticleRow): Article {
  return {
    id: String(r.id),
    sourceId: String(r.source_id),
    sourceName: String(r.source_name),
    sourceTier: r.source_tier as Article["sourceTier"],
    url: String(r.url),
    title: String(r.title),
    summary: String(r.summary),
    summaryLang: r.summary_lang as Article["summaryLang"],
    summaryKind: r.summary_kind as Article["summaryKind"],
    originalExcerpt: (r.original_excerpt as string) || undefined,
    imageUrl: (r.image_url as string) || undefined,
    publishedAt: String(r.published_at),
    fetchedAt: String(r.fetched_at),
    lastCheckedAt: String(r.last_checked_at),
    updatedAt: (r.updated_at as string) || undefined,
    revision: Number(r.revision),
    reliability: r.reliability as Reliability,
    reliabilityReason: String(r.reliability_reason),
    categories: parseList(r.categories) as NewsCategory[],
    productionIds: parseList(r.production_ids),
    characterIds: parseList(r.character_ids),
    clusterId: String(r.cluster_id),
    isTrailer: Number(r.is_trailer) === 1,
    contentHash: String(r.content_hash),
    youtubeId: (r.youtube_id as string) || undefined,
  };
}

export async function getArticle(id: string): Promise<Article | null> {
  const sql = await getSql();
  const rows = await sql.all("SELECT * FROM articles WHERE id = $1", [id]);
  return rows[0] ? rowToArticle(rows[0]) : null;
}

export async function getArticleMeta(id: string) {
  const sql = await getSql();
  const rows = await sql.all<{ content_hash: string; revision: number; title_fingerprint: string }>(
    "SELECT content_hash, revision, title_fingerprint FROM articles WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}

export async function insertArticle(a: Article, titleFingerprint: string) {
  const sql = await getSql();
  await sql.run(
    `INSERT INTO articles (id, source_id, source_name, source_tier, url, title, summary, summary_lang, summary_kind,
      original_excerpt, image_url, published_at, fetched_at, last_checked_at, updated_at, revision, reliability,
      reliability_reason, categories, production_ids, character_ids, cluster_id, is_trailer, content_hash, youtube_id, title_fingerprint)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)`,
    [
      a.id, a.sourceId, a.sourceName, a.sourceTier, a.url, a.title, a.summary, a.summaryLang, a.summaryKind,
      a.originalExcerpt ?? null, a.imageUrl ?? null, a.publishedAt, a.fetchedAt, a.lastCheckedAt, a.updatedAt ?? null,
      a.revision, a.reliability, a.reliabilityReason, JSON.stringify(a.categories), JSON.stringify(a.productionIds),
      JSON.stringify(a.characterIds), a.clusterId, a.isTrailer ? 1 : 0, a.contentHash, a.youtubeId ?? null, titleFingerprint,
    ],
  );
}

/** Mise à jour d'un article existant lorsque la source a corrigé son contenu. */
export async function updateArticleContent(a: Article, titleFingerprint: string) {
  const sql = await getSql();
  await sql.run(
    `UPDATE articles SET title=$2, summary=$3, summary_lang=$4, summary_kind=$5, original_excerpt=$6, image_url=$7,
      last_checked_at=$8, updated_at=$9, revision=$10, reliability=$11, reliability_reason=$12, categories=$13,
      production_ids=$14, character_ids=$15, is_trailer=$16, content_hash=$17, title_fingerprint=$18
     WHERE id=$1`,
    [
      a.id, a.title, a.summary, a.summaryLang, a.summaryKind, a.originalExcerpt ?? null, a.imageUrl ?? null,
      a.lastCheckedAt, a.updatedAt ?? null, a.revision, a.reliability, a.reliabilityReason,
      JSON.stringify(a.categories), JSON.stringify(a.productionIds), JSON.stringify(a.characterIds),
      a.isTrailer ? 1 : 0, a.contentHash, titleFingerprint,
    ],
  );
}

export async function touchArticle(id: string, at: string) {
  const sql = await getSql();
  await sql.run("UPDATE articles SET last_checked_at = $2 WHERE id = $1", [id, at]);
}

/** Empreintes de titres récents, pour la détection de doublons inter-sources. */
export async function recentFingerprints(sinceIso: string) {
  const sql = await getSql();
  const rows = await sql.all<{ id: string; cluster_id: string; title_fingerprint: string; source_id: string; source_tier: string; production_ids: string; character_ids: string }>(
    "SELECT id, cluster_id, title_fingerprint, source_id, source_tier, production_ids, character_ids FROM articles WHERE published_at >= $1",
    [sinceIso],
  );
  return rows.map((r) => ({ ...r, entities: [...parseList(r.production_ids), ...parseList(r.character_ids)] }));
}

export interface ArticleFilters {
  category?: NewsCategory;
  reliability?: Reliability;
  productionId?: string;
  characterId?: string;
  sourceId?: string;
  from?: string;
  to?: string;
  q?: string;
  trailersOnly?: boolean;
  limit?: number;
  offset?: number;
}

export async function listArticles(f: ArticleFilters = {}): Promise<{ items: Article[]; total: number }> {
  const sql = await getSql();
  const where: string[] = [];
  const params: unknown[] = [];
  const p = (v: unknown) => {
    params.push(v);
    return `$${params.length}`;
  };
  if (f.category) where.push(`categories LIKE ${p(`%"${f.category}"%`)}`);
  if (f.reliability) where.push(`reliability = ${p(f.reliability)}`);
  if (f.productionId) where.push(`production_ids LIKE ${p(`%"${f.productionId}"%`)}`);
  if (f.characterId) where.push(`character_ids LIKE ${p(`%"${f.characterId}"%`)}`);
  if (f.sourceId) where.push(`source_id = ${p(f.sourceId)}`);
  if (f.from) where.push(`published_at >= ${p(f.from)}`);
  if (f.to) where.push(`published_at <= ${p(f.to)}`);
  if (f.trailersOnly) where.push(`is_trailer = 1`);
  if (f.q) {
    const like = `%${f.q.toLowerCase()}%`;
    where.push(`(LOWER(title) LIKE ${p(like)} OR LOWER(summary) LIKE ${p(like)})`);
  }
  const w = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const limit = Math.min(Math.max(f.limit ?? 30, 1), 100);
  const offset = Math.max(f.offset ?? 0, 0);
  const countRows = await sql.all<{ n: number | string }>(`SELECT COUNT(*) AS n FROM articles ${w}`, params);
  const rows = await sql.all(
    `SELECT * FROM articles ${w} ORDER BY published_at DESC LIMIT ${limit} OFFSET ${offset}`,
    params,
  );
  return { items: rows.map(rowToArticle), total: Number(countRows[0]?.n ?? 0) };
}

export async function clusterArticles(clusterId: string): Promise<Article[]> {
  const sql = await getSql();
  const rows = await sql.all("SELECT * FROM articles WHERE cluster_id = $1 ORDER BY published_at ASC", [clusterId]);
  return rows.map(rowToArticle);
}

export async function countByReliability() {
  const sql = await getSql();
  const rows = await sql.all<{ reliability: Reliability; n: number | string }>(
    "SELECT reliability, COUNT(*) AS n FROM articles GROUP BY reliability",
  );
  return Object.fromEntries(rows.map((r) => [r.reliability, Number(r.n)])) as Partial<Record<Reliability, number>>;
}

/* ───────────── Exécutions d'ingestion ───────────── */

export async function saveRun(run: IngestionRun) {
  const sql = await getSql();
  await sql.run(
    `INSERT INTO ingestion_runs (id, started_at, finished_at, trigger, status, stats, log) VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (id) DO UPDATE SET finished_at = excluded.finished_at, status = excluded.status, stats = excluded.stats, log = excluded.log`,
    [run.id, run.startedAt, run.finishedAt ?? null, run.trigger, run.status, JSON.stringify(run.stats), JSON.stringify(run.log)],
  );
}

export async function listRuns(limit = 20): Promise<IngestionRun[]> {
  const sql = await getSql();
  const rows = await sql.all<Record<string, string>>(
    `SELECT * FROM ingestion_runs ORDER BY started_at DESC LIMIT ${Math.min(limit, 100)}`,
  );
  return rows.map((r) => ({
    id: r.id,
    startedAt: r.started_at,
    finishedAt: r.finished_at || undefined,
    trigger: r.trigger as IngestionRun["trigger"],
    status: r.status as IngestionRun["status"],
    stats: JSON.parse(r.stats),
    log: JSON.parse(r.log),
  }));
}

/** Marque comme échouées les exécutions restées « en cours » (processus interrompu). */
export async function failStaleRuns(olderThanIso: string) {
  const sql = await getSql();
  await sql.run(
    "UPDATE ingestion_runs SET status = 'echec', finished_at = $1 WHERE status = 'en-cours' AND started_at < $1",
    [olderThanIso],
  );
}

/* ───────────── Santé des sources ───────────── */

export async function getHealth(sourceId: string): Promise<SourceHealth | null> {
  const all = await listHealth();
  return all.find((h) => h.sourceId === sourceId) ?? null;
}

export async function listHealth(): Promise<SourceHealth[]> {
  const sql = await getSql();
  const rows = await sql.all<Record<string, unknown>>("SELECT * FROM source_health");
  return rows.map((r) => ({
    sourceId: String(r.source_id),
    lastAttemptAt: (r.last_attempt_at as string) || undefined,
    lastSuccessAt: (r.last_success_at as string) || undefined,
    lastError: (r.last_error as string) || undefined,
    consecutiveFailures: Number(r.consecutive_failures),
    etag: (r.etag as string) || undefined,
    lastModified: (r.last_modified as string) || undefined,
    lastItemCount: r.last_item_count == null ? undefined : Number(r.last_item_count),
  }));
}

export async function saveHealth(h: SourceHealth) {
  const sql = await getSql();
  await sql.run(
    `INSERT INTO source_health (source_id, last_attempt_at, last_success_at, last_error, consecutive_failures, etag, last_modified, last_item_count)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (source_id) DO UPDATE SET last_attempt_at = excluded.last_attempt_at, last_success_at = excluded.last_success_at,
       last_error = excluded.last_error, consecutive_failures = excluded.consecutive_failures, etag = excluded.etag,
       last_modified = excluded.last_modified, last_item_count = excluded.last_item_count`,
    [h.sourceId, h.lastAttemptAt ?? null, h.lastSuccessAt ?? null, h.lastError ?? null, h.consecutiveFailures,
     h.etag ?? null, h.lastModified ?? null, h.lastItemCount ?? null],
  );
}

/* ───────────── Médias de productions (TMDB) ───────────── */

export interface ProductionMedia {
  productionId: string;
  provider: string;
  providerId?: string;
  posterPath?: string;
  backdropPath?: string;
  providerReleaseDate?: string;
  providerRuntime?: number;
  fetchedAt: string;
}

export async function listProductionMedia(): Promise<Record<string, ProductionMedia>> {
  try {
    const sql = await getSql();
    const rows = await sql.all<Record<string, unknown>>("SELECT * FROM production_media");
    return Object.fromEntries(
      rows.map((r) => [
        String(r.production_id),
        {
          productionId: String(r.production_id),
          provider: String(r.provider),
          providerId: (r.provider_id as string) || undefined,
          posterPath: (r.poster_path as string) || undefined,
          backdropPath: (r.backdrop_path as string) || undefined,
          providerReleaseDate: (r.provider_release_date as string) || undefined,
          providerRuntime: r.provider_runtime == null ? undefined : Number(r.provider_runtime),
          fetchedAt: String(r.fetched_at),
        },
      ]),
    );
  } catch {
    return {};
  }
}

export async function saveProductionMedia(m: ProductionMedia) {
  const sql = await getSql();
  await sql.run(
    `INSERT INTO production_media (production_id, provider, provider_id, poster_path, backdrop_path, provider_release_date, provider_runtime, fetched_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (production_id) DO UPDATE SET provider = excluded.provider, provider_id = excluded.provider_id,
       poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
       provider_release_date = excluded.provider_release_date, provider_runtime = excluded.provider_runtime, fetched_at = excluded.fetched_at`,
    [m.productionId, m.provider, m.providerId ?? null, m.posterPath ?? null, m.backdropPath ?? null,
     m.providerReleaseDate ?? null, m.providerRuntime ?? null, m.fetchedAt],
  );
}

/** Nombre de sources distinctes par sujet (cluster). */
export async function clusterSourceCounts(clusterIds: string[]): Promise<Record<string, number>> {
  const ids = [...new Set(clusterIds)].slice(0, 200);
  if (!ids.length) return {};
  const sql = await getSql();
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
  const rows = await sql.all<{ cluster_id: string; n: number | string }>(
    `SELECT cluster_id, COUNT(DISTINCT source_id) AS n FROM articles WHERE cluster_id IN (${placeholders}) GROUP BY cluster_id`,
    ids,
  );
  return Object.fromEntries(rows.map((r) => [r.cluster_id, Number(r.n)]));
}
