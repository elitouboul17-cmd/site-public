import { createHash } from "node:crypto";
import { normalize } from "../text";

const TRACKING = /^(utm_|fbclid|gclid|mc_|ref$|ref_|cmp|ito|xtor|at_medium|at_campaign|feature$)/i;

/** URL canonique : https, sans paramètres de suivi, sans fragment ni barre finale. */
export function canonicalUrl(u: string): string {
  try {
    const url = new URL(u.trim());
    url.protocol = "https:";
    url.hash = "";
    url.hostname = url.hostname.replace(/^www\./, "");
    for (const k of [...url.searchParams.keys()]) if (TRACKING.test(k)) url.searchParams.delete(k);
    // YouTube : on ne garde que l'identifiant de vidéo
    if (/youtube\.com$/.test(url.hostname) && url.pathname.startsWith("/shorts/")) return `https://youtube.com/watch?v=${url.pathname.split("/")[2]}`;
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return u.trim();
  }
}

export const hashId = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 20);

const STOP = new Set(
  ("the a an of to in on for and or with at by from as is are was be will its it this that new first after into over about " +
    "le la les un une des du de d l et ou en au aux pour par sur dans avec sans est sont sera son sa ses ce cette qui que " +
    "marvel marvels official officiel trailer teaser exclusive exclusif video vidéo watch").split(" "),
);

/** Empreinte de titre : mots significatifs normalisés, triés. */
export function titleFingerprint(title: string): string {
  const words = normalize(title)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
  return [...new Set(words)].sort().join(" ");
}

export function jaccard(a: string, b: string): number {
  const A = new Set(a.split(" ").filter(Boolean));
  const B = new Set(b.split(" ").filter(Boolean));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

/** Seuil de similarité au-delà duquel deux titres traitent du même sujet. */
export const SAME_STORY = 0.5;
/** Seuil abaissé lorsque les deux articles citent la même production ou le même personnage. */
export const SAME_STORY_WITH_ENTITY = 0.3;

export function contentHash(title: string, summary: string, imageUrl?: string) {
  return hashId(`${title}\n${summary}\n${imageUrl ?? ""}`);
}
