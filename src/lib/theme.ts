import { PRODUCTION_THEMES, CONTINUITY_THEMES, type ProductionTheme } from "@/data/themes";
import type { Production } from "./types";

export function themeFor(p: Pick<Production, "id" | "continuity">): ProductionTheme & { dedicated: boolean } {
  const own = PRODUCTION_THEMES[p.id];
  return own ? { ...own, dedicated: true } : { ...CONTINUITY_THEMES[p.continuity], dedicated: false };
}

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Luminance relative (WCAG). */
export function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function mix(hex: string, other: string, t: number) {
  const a = rgb(hex), b = rgb(other);
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/** Version de la couleur lisible en texte sur fond sombre (contraste ≥ 4,5:1 sur #0c0d10). */
export function readableOnDark(hex: string) {
  let c = hex;
  for (let i = 0; i < 10 && (luminance(c) + 0.05) / (0.0039 + 0.05) < 4.5; i++) c = mix(c, "#ffffff", 0.15);
  return c;
}

/** Couleur la plus « vive » du trio, utilisée pour les accents (barres, bordures, puces actives). */
export function accentOf(colors: readonly string[]) {
  const usable = colors.filter((c) => luminance(c) > 0.03 && luminance(c) < 0.85);
  return usable[0] ?? colors[0];
}

/** Variables CSS appliquées à une fiche thématisée. */
export function themeVars(p: Pick<Production, "id" | "continuity">): React.CSSProperties {
  const { colors } = themeFor(p);
  const accent = accentOf(colors);
  return {
    "--t1": colors[0],
    "--t2": colors[1],
    "--t3": colors[2],
    "--accent": accent,
    "--accent-text": readableOnDark(accent),
    "--accent-ink": luminance(accent) > 0.35 ? "#0c0d10" : "#ffffff",
  } as React.CSSProperties;
}
