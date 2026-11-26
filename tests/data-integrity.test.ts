import { describe, expect, it } from "vitest";
import { PRODUCTIONS, CHARACTERS, BEHIND_THE_SCENES, TIMELINE, UNIVERSES, QUIZ, productionById, characterById } from "@/lib/catalog";

describe("intégrité du corpus éditorial", () => {
  it("identifiants de productions uniques", () => {
    const ids = PRODUCTIONS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("identifiants de personnages uniques", () => {
    const ids = CHARACTERS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("toutes les références de personnages existent", () => {
    const missing: string[] = [];
    for (const p of PRODUCTIONS) {
      for (const [, , cid] of p.cast ?? []) if (cid && !characterById.has(cid)) missing.push(`${p.id} → ${cid}`);
      for (const cid of p.characters ?? []) if (!characterById.has(cid)) missing.push(`${p.id} → ${cid}`);
    }
    for (const c of CHARACTERS)
      for (const ref of [...(c.allies ?? []), ...(c.enemies ?? []), ...(c.affiliations ?? []), ...(c.relations ?? []).map((r) => r.characterId)])
        if (!characterById.has(ref)) missing.push(`${c.id} → ${ref}`);
    expect(missing).toEqual([]);
  });
  it("toutes les références de productions existent", () => {
    const missing: string[] = [];
    const check = (from: string, id: string) => { if (!productionById.has(id)) missing.push(`${from} → ${id}`); };
    for (const p of PRODUCTIONS) for (const c of p.connections ?? []) check(p.id, c.productionId);
    for (const c of CHARACTERS) if (c.firstAppearance?.mcuProductionId) check(c.id, c.firstAppearance.mcuProductionId);
    for (const b of BEHIND_THE_SCENES) b.productionIds.forEach((id) => check(b.id, id));
    for (const t of TIMELINE) t.productionIds.forEach((id) => check(t.id, id));
    for (const u of UNIVERSES) { u.productionIds.forEach((id) => check(u.id, id)); u.confirmedLinks?.forEach((l) => check(u.id, l.productionId)); }
    expect(missing).toEqual([]);
  });
  it("les dates sont au format ISO (complet ou partiel)", () => {
    const bad = PRODUCTIONS.filter((p) => p.releaseDate && !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(p.releaseDate)).map((p) => p.id);
    expect(bad).toEqual([]);
  });
  it("une production sans date n'est jamais marquée « date officielle »", () => {
    const bad = PRODUCTIONS.filter((p) => !p.releaseDate && p.dateCertainty === "officielle").map((p) => p.id);
    expect(bad).toEqual([]);
  });
  it("chaque production, coulisse, événement de chronologie et question de quiz a une source", () => {
    expect(PRODUCTIONS.filter((p) => !p.sources?.length).map((p) => p.id)).toEqual([]);
    expect(BEHIND_THE_SCENES.filter((b) => !b.sources?.length).map((b) => b.id)).toEqual([]);
    expect(TIMELINE.filter((t) => !t.sources?.length).map((t) => t.id)).toEqual([]);
    expect(QUIZ.filter((q) => !q.source?.url).map((q) => q.id)).toEqual([]);
  });
  it("les réponses de quiz pointent vers un choix existant", () => {
    expect(QUIZ.filter((q) => q.answer < 0 || q.answer >= q.choices.length).map((q) => q.id)).toEqual([]);
  });
});

describe("photos des personnes", () => {
  it("licences libres, crédits et personnes existantes", async () => {
    const photos = (await import("@/data/person-photos.json")).default as Record<string, { src: string; author: string; license: string; filePage: string }>;
    const { PEOPLE } = await import("@/lib/catalog");
    for (const [id, p] of Object.entries(photos)) {
      expect(PEOPLE.has(id), id).toBe(true);
      expect(p.src).toMatch(/^https:\/\/(upload|thumb)\.wikimedia\.org\//);
      expect(p.filePage).toMatch(/^https:\/\//);
      expect(p.author.length).toBeGreaterThan(0);
      expect(p.license).toMatch(/^(cc[ -]?by|cc0|public domain|pd)/i);
      expect(p.license).not.toMatch(/\b(nc|nd)\b/i);
    }
    expect(photos["jeff-kaplan"]).toBeUndefined();
  });
});
