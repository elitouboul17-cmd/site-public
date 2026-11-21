import { describe, expect, it } from "vitest";
import { classifyReliability, linkEntities, isMarvelRelevant, excerpt, detectTrailer } from "@/lib/ingest/classify";
import { canonicalUrl, titleFingerprint, jaccard } from "@/lib/ingest/dedupe";
import { parseFeed, htmlToText } from "@/lib/ingest/parse";
import { robotsDisallows } from "@/lib/ingest/run";

const media = { tier: "media" as const, name: "Média" };
const official = { tier: "officielle" as const, name: "Disney" };

describe("fiabilité", () => {
  it("officiel uniquement pour une source officielle", () => {
    expect(classifyReliability(official, "Marvel announces X", "").reliability).toBe("officiel");
    expect(classifyReliability(media, "Marvel announces X", "").reliability).toBe("reporte");
  });
  it("rumeur et théorie détectées en anglais et en français", () => {
    expect(classifyReliability(media, "Rumeur : un retour surprise", "").reliability).toBe("rumeur");
    expect(classifyReliability(media, "X", "Selon une information non confirmée, le film serait repoussé.").reliability).toBe("rumeur");
    expect(classifyReliability(media, "Leaked set photos reveal costume", "").reliability).toBe("rumeur");
    expect(classifyReliability(media, "Cette théorie sur Loki change tout", "").reliability).toBe("theorie");
  });
  it("une mention de rumeur hors de l'information principale ne déclasse pas l'article", () => {
    expect(classifyReliability(media, "Actor in talks for role", "Actor has entered talks, sources say. While unconfirmed, other names circulate.").reliability).toBe("reporte");
  });
});

describe("association aux productions et personnages", () => {
  it("variantes de ponctuation des titres", () => {
    expect(linkEntities("Avengers Doomsday : budget record").productionIds).toContain("avengers-doomsday");
    expect(linkEntities("‘Spider-Man: Brand New Day’ re-release").productionIds).toContain("spider-man-brand-new-day");
  });
  it("un titre générique seul n'identifie pas une production", () => {
    expect(linkEntities("Thor is back").productionIds).not.toContain("thor");
    expect(linkEntities("Thor is back").characterIds).toContain("thor");
  });
  it("un titre ancien hors MCU exige l'année (remakes)", () => {
    expect(linkEntities("Connor Storrie joins Marvel's ‘Ghost Rider’").productionIds).not.toContain("ghost-rider");
  });
  it("pertinence Marvel", () => {
    expect(isMarvelRelevant("Best cooking shows", "", { productionIds: [], characterIds: [] })).toBe(false);
    expect(isMarvelRelevant("Le MCU prépare la suite", "", { productionIds: [], characterIds: [] })).toBe(true);
  });
  it("bandes-annonces", () => {
    expect(detectTrailer("Avengers: Doomsday | Official Trailer")).toBe(true);
    expect(detectTrailer("La bande-annonce de Wonder Man est là")).toBe(true);
    expect(detectTrailer("Kevin Feige interview")).toBe(false);
  });
});

describe("doublons", () => {
  it("URL canonique", () => {
    expect(canonicalUrl("http://www.site.com/a/?utm_source=x&id=2#top")).toBe("https://site.com/a?id=2");
  });
  it("similarité de titres", () => {
    const a = titleFingerprint("‘Avengers: Doomsday’ Adds Two Stars To Cast");
    const b = titleFingerprint("Avengers: Doomsday adds two stars to the cast");
    expect(jaccard(a, b)).toBeGreaterThanOrEqual(0.5);
    expect(jaccard(a, titleFingerprint("Kevin Feige talks X-Men"))).toBeLessThan(0.3);
  });
});

describe("analyse des flux", () => {
  it("texte brut sans HTML", () => {
    expect(htmlToText("<p>Bonjour&nbsp;<b>Marvel</b> &amp; Disney</p><script>alert(1)</script>")).toBe("Bonjour Marvel & Disney");
  });
  it("rejette un document qui n'est pas un flux", () => {
    expect(() => parseFeed("<html><body>nope</body></html>")).toThrow();
  });
  it("extrait propre", () => {
    expect(excerpt("A. ".repeat(300)).length).toBeLessThanOrEqual(421);
  });
  it("robots.txt", () => {
    expect(robotsDisallows("User-agent: Googlebot\nDisallow: /x\n\nUser-agent: *\nDisallow: /feeds/videos.xml\nAllow: /")).toEqual(["/feeds/videos.xml"]);
  });
});
