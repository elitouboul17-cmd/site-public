/**
 * Compatibilité PostgreSQL : le schéma et toutes les requêtes du dépôt sont exécutés
 * sur un vrai moteur PostgreSQL embarqué (PGlite), avec l'ingestion complète.
 */
import { describe, expect, it, beforeAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import type { Sql } from "@/lib/db/sql";
import type { NewsSource } from "@/lib/types";

const db = new PGlite();
const pg: Sql = {
  dialect: "postgres",
  async all<T>(q: string, params: unknown[] = []) { return (await db.query(q, params)).rows as T[]; },
  async run(q: string, params: unknown[] = []) { await db.query(q, params); },
  async exec(script: string) { await db.exec(script); },
};

const feed = `<?xml version="1.0"?><rss version="2.0"><channel><title>t</title>
<item><title>Marvel Studios sets Avengers: Doomsday trailer</title><link>https://pg.example/a</link><pubDate>Fri, 20 Nov 2026 10:00:00 +0000</pubDate><description>Marvel news.</description></item>
<item><title>Rumor: Marvel's Blade reboot back on</title><link>https://pg.example/b</link><pubDate>Fri, 20 Nov 2026 11:00:00 +0000</pubDate><description>Insider claims.</description></item>
</channel></rss>`;
const SOURCES: NewsSource[] = [{ id: "pg", name: "PG", homepage: "https://pg.example", feedUrl: "https://pg.example/feed", format: "rss", tier: "media", language: "en", requiresMarvelFilter: true, minIntervalMinutes: 60, enabled: true }];
const fakeFetch = (async (u: string | URL | Request) => new Response(String(u).endsWith("robots.txt") ? "" : feed)) as typeof fetch;

describe("PostgreSQL (PGlite)", () => {
  beforeAll(async () => {
    const { setSqlForTesting } = await import("@/lib/db/sql");
    setSqlForTesting(pg);
  });

  it("migrations, ingestion et requêtes", async () => {
    const { runIngestion } = await import("@/lib/ingest/run");
    const repo = await import("@/lib/db/repo");
    const r = await runIngestion({ trigger: "cli", force: true, fetchImpl: fakeFetch, sources: SOURCES, now: new Date("2026-11-21T12:00:00Z") });
    expect(r.status).toBe("succes");
    expect(r.stats.created).toBe(2);
    const all = await repo.listArticles({ limit: 10 });
    expect(all.total).toBe(2);
    expect((await repo.listArticles({ reliability: "rumeur" })).total).toBe(1);
    expect((await repo.listArticles({ q: "doomsday" })).items[0].productionIds).toContain("avengers-doomsday");
    expect(await repo.clusterSourceCounts(all.items.map((a) => a.clusterId))).toBeTruthy();
    expect((await repo.countByReliability()).rumeur).toBe(1);
    expect((await repo.listRuns()).length).toBe(1);
    expect((await repo.listHealth())[0].consecutiveFailures).toBe(0);
    const again = await runIngestion({ trigger: "cli", force: true, fetchImpl: fakeFetch, sources: SOURCES, now: new Date("2026-11-21T13:00:00Z") });
    expect(again.stats.duplicates).toBe(2);
    await repo.saveProductionMedia({ productionId: "iron-man", provider: "tmdb", posterPath: "/x.jpg", fetchedAt: new Date().toISOString() });
    expect((await repo.listProductionMedia())["iron-man"].posterPath).toBe("/x.jpg");
  });
});
