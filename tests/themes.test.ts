import { describe, expect, it } from "vitest";
import { PRODUCTIONS } from "@/lib/catalog";
import { PRODUCTION_THEMES } from "@/data/themes";
import { readableOnDark, luminance, accentOf } from "@/lib/theme";

describe("identité colorée des fiches", () => {
  it("chaque production a sa propre palette", () => {
    expect(PRODUCTIONS.filter((p) => !PRODUCTION_THEMES[p.id]).map((p) => p.id)).toEqual([]);
  });
  it("aucune palette orpheline", () => {
    const ids = new Set(PRODUCTIONS.map((p) => p.id));
    expect(Object.keys(PRODUCTION_THEMES).filter((id) => !ids.has(id))).toEqual([]);
  });
  it("couleurs hexadécimales valides", () => {
    for (const [id, t] of Object.entries(PRODUCTION_THEMES)) for (const c of t.colors) expect(c, id).toMatch(/^#[0-9a-f]{6}$/i);
  });
  it("le texte d'accent reste lisible sur fond sombre (WCAG AA)", () => {
    for (const t of Object.values(PRODUCTION_THEMES)) {
      const c = readableOnDark(accentOf(t.colors));
      expect((luminance(c) + 0.05) / 0.0539).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("palettes demandées", () => {
    expect(PRODUCTION_THEMES.loki.mood).toMatch(/vert/i);
    expect(PRODUCTION_THEMES["captain-america-first-avenger"].mood).toMatch(/bleu, blanc et rouge/i);
    expect(PRODUCTION_THEMES["avengers-doomsday"].mood).toMatch(/vert/i);
  });
});
