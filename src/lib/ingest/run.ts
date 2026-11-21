/**
 * Orchestrateur d'ingestion.
 *
 * Pour chaque source activée (et dont l'intervalle minimal est écoulé) :
 *  1. vérifie robots.txt, puis récupère le flux (requête conditionnelle ETag / Last-Modified) ;
 *  2. analyse les éléments, filtre ceux qui ne concernent pas Marvel (flux généralistes) ;
 *  3. calcule l'identifiant stable (hash de l'URL canonique) → doublon exact ignoré ;
 *  4. si l'article existe mais que la source l'a modifié → mise à jour (révision + date) ;
 *  5. regroupe les articles traitant du même sujet (similarité de titre, fenêtre de 4 jours) ;
 *  6. classe (fiabilité, catégories) et associe productions/personnages ;
 *  7. journalise tout et met à jour l'état de santé de la source.
 * Une source en erreur n'interrompt jamais les autres.
 */
import { NEWS_SOURCES, USER_AGENT } from "@/data/sources";
import type { Article, IngestionRun, NewsSource, SourceHealth } from "../types";
import * as repo from "../db/repo";
import { parseFeed, type RawItem } from "./parse";
import { classifyReliability, categorize, detectTrailer, excerpt, isMarvelRelevant, linkEntities } from "./classify";
import { canonicalUrl, contentHash, hashId, jaccard, SAME_STORY, SAME_STORY_WITH_ENTITY, titleFingerprint } from "./dedupe";
import { summarizeFr, summarizerEnabled } from "./summarize";
import { CHARACTERS } from "@/data/characters";

/** Équipes et organisations : trop génériques pour rapprocher deux articles. */
const GROUP_IDS = new Set(CHARACTERS.filter((c) => c.kind === "equipe" || c.kind === "organisation").map((c) => c.id));

const FETCH_TIMEOUT_MS = 15_000;
const MAX_FEED_BYTES = 5 * 1024 * 1024;
const MAX_ITEMS_PER_SOURCE = 60;
const MAX_AI_SUMMARIES_PER_RUN = Number(process.env.MAX_AI_SUMMARIES_PER_RUN || 25);

export interface RunOptions {
  trigger: IngestionRun["trigger"];
  /** Ignore l'intervalle minimal des sources. */
  force?: boolean;
  sourceIds?: string[];
  /** Pour les tests : fetch injectable. */
  fetchImpl?: typeof fetch;
  sources?: NewsSource[];
  now?: Date;
}

type Log = IngestionRun["log"];

/* ───────── robots.txt ───────── */

const robotsCache = new Map<string, { at: number; disallow: string[] }>();

export function robotsDisallows(robotsTxt: string): string[] {
  const lines = robotsTxt.split(/\r?\n/).map((l) => l.replace(/#.*/, "").trim());
  const out: string[] = [];
  let applies = false;
  let sawRule = false;
  for (const line of lines) {
    const [k, ...rest] = line.split(":");
    const key = k?.toLowerCase().trim();
    const value = rest.join(":").trim();
    if (key === "user-agent") {
      if (sawRule) { applies = false; sawRule = false; }
      if (value === "*" || /marvelhq/i.test(value)) applies = true;
    } else if (key === "disallow" || key === "allow") {
      sawRule = true;
      if (applies && key === "disallow" && value) out.push(value);
    }
  }
  return out;
}

async function allowedByRobots(url: string, f: typeof fetch): Promise<boolean> {
  const u = new URL(url);
  const cached = robotsCache.get(u.origin);
  let disallow = cached && Date.now() - cached.at < 6 * 3600_000 ? cached.disallow : undefined;
  if (!disallow) {
    try {
      const res = await f(`${u.origin}/robots.txt`, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(8000) });
      disallow = res.ok ? robotsDisallows(await res.text()) : [];
    } catch {
      disallow = []; // robots.txt injoignable : pas d'interdiction déclarée
    }
    robotsCache.set(u.origin, { at: Date.now(), disallow });
  }
  const path = u.pathname + u.search;
  return !disallow.some((rule) => {
    const pattern = "^" + rule.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$");
    return new RegExp(pattern).test(path);
  });
}

/* ───────── Récupération ───────── */

/**
 * YouTube Data API v3 (officielle). Le flux RSS de YouTube est interdit aux robots par
 * youtube.com/robots.txt ; l'API est l'alternative légale (clé gratuite, quota journalier).
 * Coût : 1 unité de quota par appel (playlistItems.list), sur 10 000 par jour.
 */
async function fetchYoutubeApi(source: NewsSource, f: typeof fetch): Promise<RawItem[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new MissingKeyError("YOUTUBE_API_KEY non configurée : source YouTube inactive");
  const channelId = new URL(source.feedUrl).searchParams.get("channel_id") ?? "";
  const playlistId = "UU" + channelId.slice(2);
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?${new URLSearchParams({ part: "snippet", playlistId, maxResults: "25", key })}`;
  const res = await f(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`YouTube Data API HTTP ${res.status}`);
  const data = (await res.json()) as { items?: { snippet: { title: string; description: string; publishedAt: string; resourceId: { videoId: string }; thumbnails?: Record<string, { url: string }> } }[] };
  return (data.items ?? []).map(({ snippet: s }) => ({
    guid: `yt:video:${s.resourceId.videoId}`,
    url: `https://www.youtube.com/watch?v=${s.resourceId.videoId}`,
    title: s.title,
    description: s.description,
    published: s.publishedAt,
    imageUrl: s.thumbnails?.high?.url ?? s.thumbnails?.medium?.url ?? `https://i.ytimg.com/vi/${s.resourceId.videoId}/hqdefault.jpg`,
    categories: [],
    youtubeId: s.resourceId.videoId,
  }));
}

export class MissingKeyError extends Error {}

async function fetchFeed(source: NewsSource, health: SourceHealth | null, f: typeof fetch) {
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5",
  };
  if (health?.etag) headers["If-None-Match"] = health.etag;
  if (health?.lastModified) headers["If-Modified-Since"] = health.lastModified;
  const res = await f(source.feedUrl, { headers, redirect: "follow", signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (res.status === 304) return { notModified: true as const };
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`.trim());
  const len = Number(res.headers.get("content-length") || 0);
  if (len > MAX_FEED_BYTES) throw new Error(`Flux trop volumineux (${len} octets)`);
  const body = await res.text();
  if (body.length > MAX_FEED_BYTES) throw new Error("Flux trop volumineux");
  return { notModified: false as const, body, etag: res.headers.get("etag") ?? undefined, lastModified: res.headers.get("last-modified") ?? undefined };
}

function toIso(d?: string, fallback?: string): string {
  if (d) {
    const t = new Date(d);
    if (!Number.isNaN(t.getTime())) return t.toISOString();
  }
  return fallback ?? new Date().toISOString();
}

/* ───────── Traitement d'un élément ───────── */

async function buildArticle(source: NewsSource, item: RawItem, nowIso: string, allowAi: () => boolean) {
  if (!item.url || !item.title) return { skip: "élément sans URL ou sans titre" as const };
  const url = canonicalUrl(item.url);
  if (!/^https:\/\//.test(url)) return { skip: "URL non HTTPS" as const };
  const linked = linkEntities(`${item.title}\n${item.description.slice(0, 1500)}`);
  if (source.requiresMarvelFilter && !isMarvelRelevant(item.title, item.description, linked)) return { skip: "hors sujet Marvel" as const };

  const isTrailer = detectTrailer(item.title);
  const { reliability, reason } = classifyReliability(source, item.title, item.description);
  const original = excerpt(item.description);

  const article: Article = {
    id: hashId(url),
    sourceId: source.id,
    sourceName: source.name,
    sourceTier: source.tier,
    url,
    title: item.title,
    summary: original,
    summaryLang: source.language,
    summaryKind: original ? "extrait-source" : "aucun",
    originalExcerpt: original || undefined,
    imageUrl: item.imageUrl,
    publishedAt: toIso(item.published, nowIso),
    fetchedAt: nowIso,
    lastCheckedAt: nowIso,
    revision: 1,
    reliability,
    reliabilityReason: reason,
    categories: categorize(source, item.title, item.description, linked.productionIds, isTrailer),
    productionIds: linked.productionIds,
    characterIds: linked.characterIds,
    clusterId: "",
    isTrailer,
    contentHash: contentHash(item.title, original, item.imageUrl),
    youtubeId: item.youtubeId,
  };

  // Résumé FR par IA (facultatif) : uniquement pour les sources anglophones.
  const enrich = async () => {
    if (source.language === "en" && original && allowAi()) {
      const fr = await summarizeFr(item.title, original);
      if (fr) {
        article.summary = fr;
        article.summaryLang = "fr";
        article.summaryKind = "resume-ia";
      }
    }
  };
  return { article, enrich };
}

/* ───────── Exécution ───────── */

export async function runIngestion(opts: RunOptions): Promise<IngestionRun> {
  const f = opts.fetchImpl ?? fetch;
  const now = opts.now ?? new Date();
  const nowIso = now.toISOString();
  const log: Log = [];
  const say = (level: Log[number]["level"], message: string, sourceId?: string) => {
    log.push({ level, message, sourceId, at: new Date().toISOString() });
    (level === "error" ? console.error : level === "warn" ? console.warn : console.log)(`[ingest]${sourceId ? ` [${sourceId}]` : ""} ${message}`);
  };

  await repo.failStaleRuns(new Date(now.getTime() - 30 * 60_000).toISOString());
  const recentRuns = await repo.listRuns(5);
  const running = recentRuns.find((r) => r.status === "en-cours");
  if (running && !opts.force) {
    say("warn", `Une ingestion est déjà en cours (démarrée ${running.startedAt}) : exécution ignorée.`);
    return { id: "ignoree", startedAt: nowIso, finishedAt: nowIso, trigger: opts.trigger, status: "echec", stats: { fetched: 0, created: 0, updated: 0, skipped: 0, duplicates: 0, errors: 0 }, log };
  }

  const run: IngestionRun = {
    id: `run-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    startedAt: nowIso,
    trigger: opts.trigger,
    status: "en-cours",
    stats: { fetched: 0, created: 0, updated: 0, skipped: 0, duplicates: 0, errors: 0 },
    log,
  };
  await repo.saveRun(run);

  const sources = (opts.sources ?? NEWS_SOURCES).filter((s) => s.enabled && (!opts.sourceIds || opts.sourceIds.includes(s.id)));
  const recent = await repo.recentFingerprints(new Date(now.getTime() - 4 * 86400_000).toISOString());
  let aiBudget = summarizerEnabled() ? MAX_AI_SUMMARIES_PER_RUN : 0;
  const allowAi = () => (aiBudget-- > 0);
  let sourcesOk = 0;

  for (const source of sources) {
    const health: SourceHealth = (await repo.getHealth(source.id)) ?? { sourceId: source.id, consecutiveFailures: 0 };
    if (!opts.force && health.lastAttemptAt) {
      const elapsed = (now.getTime() - new Date(health.lastAttemptAt).getTime()) / 60_000;
      // Recul exponentiel après échecs répétés (max 24 h)
      const wait = Math.min(source.minIntervalMinutes * 2 ** Math.min(health.consecutiveFailures, 5), 1440);
      if (elapsed < wait) {
        say("info", `Ignorée : dernière tentative il y a ${Math.round(elapsed)} min (intervalle ${wait} min).`, source.id);
        sourcesOk++;
        continue;
      }
    }
    health.lastAttemptAt = nowIso;
    try {
      let result: Awaited<ReturnType<typeof fetchFeed>> | { notModified: false; items: RawItem[] };
      if (source.format === "youtube-api") {
        result = { notModified: false, items: await fetchYoutubeApi(source, f) };
      } else {
        if (!(await allowedByRobots(source.feedUrl, f))) throw new Error("robots.txt interdit l'accès à ce flux : source non interrogée");
        result = await fetchFeed(source, health, f);
      }
      if (result.notModified) {
        say("info", "Flux inchangé (HTTP 304).", source.id);
      } else {
        const items = ("items" in result ? result.items : parseFeed(result.body)).slice(0, MAX_ITEMS_PER_SOURCE);
        if ("body" in result) {
          health.etag = result.etag;
          health.lastModified = result.lastModified;
        }
        health.lastItemCount = items.length;
        let created = 0, updated = 0, skipped = 0, dups = 0;
        for (const item of items) {
          run.stats.fetched++;
          const built = await buildArticle(source, item, nowIso, allowAi);
          if ("skip" in built) { skipped++; continue; }
          const { article } = built;
          const fp = titleFingerprint(article.title);
          const existing = await repo.getArticleMeta(article.id);
          if (existing) {
            if (existing.content_hash === article.contentHash) {
              await repo.touchArticle(article.id, nowIso);
              dups++;
            } else {
              // La source a corrigé ou mis à jour son article.
              await built.enrich();
              const prev = await repo.getArticle(article.id);
              await repo.updateArticleContent({ ...article, clusterId: prev?.clusterId ?? article.id, publishedAt: prev?.publishedAt ?? article.publishedAt, fetchedAt: prev?.fetchedAt ?? nowIso, revision: existing.revision + 1, updatedAt: nowIso }, fp);
              updated++;
              say("info", `Article mis à jour par la source (révision ${existing.revision + 1}) : ${article.title}`, source.id);
            }
            continue;
          }
          // Regroupement thématique : même sujet couvert par plusieurs sources.
          const entities = [...article.productionIds, ...article.characterIds.filter((c) => !GROUP_IDS.has(c))];
          const match = recent
            .map((r) => ({ r, s: jaccard(fp, r.title_fingerprint), shared: r.entities.some((e) => entities.includes(e)) }))
            .filter((x) => x.s >= SAME_STORY || (x.shared && x.s >= SAME_STORY_WITH_ENTITY))
            .sort((a, b) => b.s - a.s)[0];
          article.clusterId = match ? match.r.cluster_id : article.id;
          if (match) say("info", `Même sujet qu'un article existant (similarité ${match.s.toFixed(2)}) : regroupé.`, source.id);
          await built.enrich();
          await repo.insertArticle(article, fp);
          recent.push({ id: article.id, cluster_id: article.clusterId, title_fingerprint: fp, source_id: source.id, source_tier: source.tier, production_ids: "", character_ids: "", entities });
          created++;
        }
        run.stats.created += created;
        run.stats.updated += updated;
        run.stats.skipped += skipped;
        run.stats.duplicates += dups;
        say("info", `${items.length} éléments : ${created} nouveaux, ${updated} mis à jour, ${dups} déjà connus, ${skipped} ignorés.`, source.id);
      }
      health.lastSuccessAt = nowIso;
      health.lastError = undefined;
      health.consecutiveFailures = 0;
      sourcesOk++;
    } catch (e) {
      if (e instanceof MissingKeyError) {
        say("warn", e.message, source.id);
        health.lastError = e.message;
        await repo.saveHealth(health);
        sourcesOk++;
        continue;
      }
      const msg = e instanceof Error ? (e.name === "TimeoutError" ? `délai dépassé (${FETCH_TIMEOUT_MS / 1000} s)` : e.message) : String(e);
      health.lastError = msg;
      health.consecutiveFailures += 1;
      run.stats.errors++;
      say("error", `Source indisponible : ${msg}`, source.id);
    }
    await repo.saveHealth(health);
  }

  run.finishedAt = new Date().toISOString();
  run.status = run.stats.errors === 0 ? "succes" : sourcesOk > 0 ? "partiel" : "echec";
  await repo.saveRun(run);
  return run;
}
