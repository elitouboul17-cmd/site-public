import "server-only";
import { listArticles, clusterArticles, clusterSourceCounts, countByReliability, listHealth, listRuns, type ArticleFilters } from "./db/repo";
import type { Article } from "./types";

/** Accès aux actualités tolérant aux pannes : la page reste utilisable si la base est indisponible. */
export async function safeArticles(f: ArticleFilters = {}): Promise<{ items: Article[]; total: number; error?: string }> {
  try {
    return await listArticles(f);
  } catch (e) {
    console.error("[news] base de données indisponible", e);
    return { items: [], total: 0, error: "Base de données indisponible" };
  }
}

export async function safeCluster(clusterId: string): Promise<Article[]> {
  try {
    return await clusterArticles(clusterId);
  } catch {
    return [];
  }
}

export async function newsStatus() {
  try {
    const [health, runs, counts] = await Promise.all([listHealth(), listRuns(10), countByReliability()]);
    return { health, runs, counts, error: undefined as string | undefined };
  } catch (e) {
    return { health: [], runs: [], counts: {}, error: (e as Error).message };
  }
}

/** Productions les plus citées dans l'actualité récente (popularité mesurée, pas déclarée). */
export async function trendingProductionIds(days = 30, limit = 8): Promise<{ id: string; count: number }[]> {
  const { items } = await safeArticles({ from: new Date(Date.now() - days * 86400_000).toISOString(), limit: 100 });
  const counts = new Map<string, number>();
  const seenClusters = new Set<string>();
  for (const a of items) {
    if (seenClusters.has(a.clusterId)) continue; // un sujet repris par plusieurs médias compte une fois
    seenClusters.add(a.clusterId);
    for (const id of a.productionIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts].map(([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count).slice(0, limit);
}

/** Regroupe les articles par sujet : un seul affiché par cluster, avec le nombre de sources. */
export async function groupedArticles(f: ArticleFilters = {}) {
  const res = await safeArticles(f);
  const seen = new Set<string>();
  const items: Article[] = [];
  for (const a of res.items) {
    if (seen.has(a.clusterId)) continue;
    seen.add(a.clusterId);
    items.push(a);
  }
  let sizes: Record<string, number> = {};
  try {
    sizes = await clusterSourceCounts(items.map((a) => a.clusterId));
  } catch {
    /* base indisponible */
  }
  return { ...res, items, sizes };
}
