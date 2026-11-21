import { describe, expect, it, beforeAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { NewsSource } from "@/lib/types";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "marvelhq-test-"));
process.env.SQLITE_PATH = path.join(tmp, "test.db");
delete process.env.DATABASE_URL;
delete process.env.ANTHROPIC_API_KEY;

const fixtures = path.join(import.meta.dirname, "fixtures");
let mediaXml = fs.readFileSync(path.join(fixtures, "media.xml"), "utf8");
const officialXml = fs.readFileSync(path.join(fixtures, "official.xml"), "utf8");

const SOURCES: NewsSource[] = [
  { id: "media-test", name: "Média test", homepage: "https://media.example", feedUrl: "https://media.example/feed/", format: "rss", tier: "media", language: "en", requiresMarvelFilter: true, minIntervalMinutes: 60, enabled: true },
  { id: "official-test", name: "Officiel test", homepage: "https://official.example", feedUrl: "https://official.example/feed.atom", format: "atom", tier: "officielle", language: "en", requiresMarvelFilter: false, minIntervalMinutes: 60, enabled: true },
  { id: "broken-test", name: "Source en panne", homepage: "https://broken.example", feedUrl: "https://broken.example/feed/", format: "rss", tier: "media", language: "en", requiresMarvelFilter: false, minIntervalMinutes: 60, enabled: true },
  { id: "blocked-test", name: "Source interdite", homepage: "https://blocked.example", feedUrl: "https://blocked.example/feeds/videos.xml", format: "rss", tier: "media", language: "en", requiresMarvelFilter: false, minIntervalMinutes: 60, enabled: true },
];

const fakeFetch = (async (input: string | URL | Request) => {
  const url = String(input);
  if (url.endsWith("/robots.txt")) {
    return new Response(url.includes("blocked") ? "User-agent: *\nDisallow: /feeds/videos.xml\n" : "User-agent: *\nDisallow: /wp-admin/\n", { status: 200 });
  }
  if (url.startsWith("https://media.example/feed")) return new Response(mediaXml, { status: 200, headers: { "content-type": "application/rss+xml" } });
  if (url.startsWith("https://official.example/feed")) return new Response(officialXml, { status: 200 });
  if (url.startsWith("https://broken.example")) return new Response("oops", { status: 503, statusText: "Service Unavailable" });
  throw new Error("URL inattendue " + url);
}) as typeof fetch;

let run: typeof import("@/lib/ingest/run");
let repo: typeof import("@/lib/db/repo");

beforeAll(async () => {
  run = await import("@/lib/ingest/run");
  repo = await import("@/lib/db/repo");
});

describe("ingestion de bout en bout (flux simulés)", () => {
  it("récupère, filtre, classe, regroupe et journalise", async () => {
    const r = await run.runIngestion({ trigger: "cli", force: true, fetchImpl: fakeFetch, sources: SOURCES, now: new Date("2026-11-21T12:00:00Z") });
    expect(r.status).toBe("partiel"); // une source en panne, une interdite
    expect(r.stats.errors).toBe(2);
    expect(r.stats.created).toBe(4); // 3 articles Marvel du média + 1 officiel ; « cooking » ignoré
    expect(r.stats.skipped).toBe(1);

    const { items } = await repo.listArticles({ limit: 50 });
    const byTitle = (t: string) => items.find((a) => a.title.includes(t))!;
    expect(byTitle("Adds Two Stars To Cast").reliability).toBe("reporte");
    expect(byTitle("Rumor").reliability).toBe("rumeur");
    expect(byTitle("Fan Theory").reliability).toBe("theorie");
    expect(byTitle("Adds Two Stars to the Cast").reliability).toBe("officiel");

    // Paramètres de suivi retirés de l'URL, entité associée
    const media = byTitle("Adds Two Stars To Cast");
    expect(media.url).toBe("https://media.example/avengers-doomsday-cast");
    expect(media.productionIds).toContain("avengers-doomsday");
    expect(media.categories).toContain("casting");
    expect(media.imageUrl).toBe("https://media.example/img/doom.jpg");

    // Même sujet chez le média et la source officielle → même cluster
    expect(byTitle("Adds Two Stars to the Cast").clusterId).toBe(media.clusterId);

    const health = await repo.listHealth();
    expect(health.find((h) => h.sourceId === "broken-test")!.consecutiveFailures).toBe(1);
    expect(health.find((h) => h.sourceId === "blocked-test")!.lastError).toMatch(/robots\.txt/);
  });

  it("ignore les doublons exacts et applique les corrections de la source", async () => {
    mediaXml = mediaXml.replace("Production is under way.", "Production is under way in London.");
    const r = await run.runIngestion({ trigger: "cli", force: true, fetchImpl: fakeFetch, sources: SOURCES, now: new Date("2026-11-21T13:00:00Z") });
    expect(r.stats.created).toBe(0);
    expect(r.stats.updated).toBe(1);
    expect(r.stats.duplicates).toBe(3);
    const { items } = await repo.listArticles({ q: "doomsday", limit: 10 });
    const corrected = items.find((a) => a.sourceId === "media-test")!;
    expect(corrected.revision).toBe(2);
    expect(corrected.summary).toContain("in London");
    expect(corrected.updatedAt).toBeTruthy();
  });

  it("respecte l'intervalle minimal sans --force et applique un recul après échecs", async () => {
    const r = await run.runIngestion({ trigger: "cron", fetchImpl: fakeFetch, sources: SOURCES, now: new Date("2026-11-21T13:10:00Z") });
    expect(r.stats.fetched).toBe(0);
    expect(r.log.filter((l) => l.message.startsWith("Ignorée")).length).toBe(4);
  });

  it("filtre par fiabilité et catégorie", async () => {
    expect((await repo.listArticles({ reliability: "rumeur" })).total).toBe(1);
    expect((await repo.listArticles({ category: "casting" })).total).toBeGreaterThanOrEqual(1);
  });
});
