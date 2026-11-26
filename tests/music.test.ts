import { describe, expect, it } from "vitest";
import { FEATURED_TRACKS } from "@/data/music";
import { productionById } from "@/lib/catalog";
import { searchUrl, soundtrackQuery, PLATFORMS } from "@/lib/music";
import { searchCatalog } from "@/lib/search";

describe("musique", () => {
  it("les chansons pointent vers des productions existantes", () => {
    expect(Object.keys(FEATURED_TRACKS).filter((id) => !productionById.has(id))).toEqual([]);
  });
  it("liens de recherche valides et encodés pour chaque plateforme", () => {
    for (const pl of PLATFORMS) {
      const u = new URL(searchUrl(pl.id, "Ain't No Mountain High Enough Marvin Gaye & Tammi Terrell"));
      expect(u.protocol).toBe("https:");
      expect(u.toString()).not.toContain(" ");
      expect(decodeURIComponent(u.toString())).toContain("Marvin Gaye & Tammi Terrell");
    }
  });
  it("requête de bande originale", () => {
    expect(soundtrackQuery(productionById.get("avengers-endgame")!)).toBe("Avengers: Endgame soundtrack Alan Silvestri");
  });
  it("les chansons sont trouvables dans la recherche", () => {
    expect(searchCatalog("hooked on a feeling").some((h) => h.kind === "musique" && h.href.startsWith("/productions/guardians-of-the-galaxy#"))).toBe(true);
  });
});

describe("lecteur Deezer", () => {
  it("albums et titres associés à des productions et chansons existantes, sans album de suite", async () => {
    const d = (await import("@/data/deezer.json")).default as { albums: Record<string, { id: number; title: string }>; tracks: Record<string, { id: number }> };
    for (const [pid, a] of Object.entries(d.albums)) {
      expect(productionById.has(pid), pid).toBe(true);
      expect(Number.isInteger(a.id)).toBe(true);
    }
    expect(d.albums["deadpool"]).toBeUndefined(); // l'album « Deadpool 2 » ne doit pas être associé au premier film
    expect(d.albums["spider-man-2002"]).toBeUndefined();
    for (const key of Object.keys(d.tracks)) {
      const [pid, title] = key.split("::");
      expect(FEATURED_TRACKS[pid]?.some((t) => t.title === title), key).toBe(true);
    }
  });
});
