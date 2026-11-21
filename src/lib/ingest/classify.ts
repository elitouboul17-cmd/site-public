/**
 * Classification des actualités : pertinence Marvel, statut de fiabilité, catégories,
 * association aux productions et personnages. Règles explicites et testées
 * (tests/classify.test.ts) — pas de « boîte noire ».
 */
import { PRODUCTIONS, CHARACTERS } from "../catalog";
import type { NewsCategory, NewsSource, Reliability } from "../types";
import { normalize } from "../text";

/* ───────── Pertinence ───────── */

const STRONG_TERMS = [
  "marvel", "mcu", "avengers", "x-men", "spider-man", "spider-verse", "kevin feige", "fantastic four", "4 fantastiques",
  "quatre fantastiques", "deadpool", "wolverine", "wakanda", "thanos", "daredevil", "punisher", "venom", "thunderbolts",
  "guardians of the galaxy", "gardiens de la galaxie", "doctor strange", "docteur strange", "black panther", "captain america",
  "iron man", "spider-man", "loki", "hulk", "s.h.i.e.l.d", "mutant", "agatha", "doctor doom", "docteur fatalis", "galactus",
];

/* ───────── Association aux productions et personnages ───────── */

interface Matcher { id: string; re: RegExp; len: number }

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordRe = (term: string) => new RegExp(`(?<![\\p{L}\\p{N}])${escape(term)}(?![\\p{L}\\p{N}])`, "u");

const characterNames = new Set(CHARACTERS.flatMap((c) => [c.name, c.civilName ?? "", ...(c.aliases ?? []), ...(c.matchTerms ?? [])]).filter(Boolean).map(normalize));

/** Titres trop génériques pour identifier une production à eux seuls (ex. « Thor », « Echo »). */
function isAmbiguousTitle(t: string) {
  const n = normalize(t);
  return characterNames.has(n) || n.split(/\s+/).length === 1 && n.length < 7;
}

/** Variantes d'écriture d'un titre : « Avengers: Doomsday », « Avengers Doomsday », « Avengers – Doomsday ». */
function titleVariants(t: string): string[] {
  const loose = t.replace(/\s*[:–—-]\s+/g, " ").replace(/\s+/g, " ").trim();
  const frColon = t.replace(/\s*:\s*/g, " : ");
  return [...new Set([t, loose, frColon])];
}

/** Productions anciennes hors MCU : leur titre est souvent réutilisé (remakes, reboots). */
function needsYear(p: (typeof PRODUCTIONS)[number]) {
  return p.continuity !== "mcu" && !!p.releaseDate && Number(p.releaseDate.slice(0, 4)) < 2016;
}

const PRODUCTION_MATCHERS: (Matcher & { year?: string })[] = PRODUCTIONS.filter((p) => p.kind !== "comic")
  .flatMap((p) =>
    [...new Set([p.title, p.originalTitle])]
      .filter((t) => t.length >= 4 && !isAmbiguousTitle(t))
      .flatMap(titleVariants)
      .map((t) => ({ id: p.id, re: wordRe(t), len: t.length, year: needsYear(p) ? p.releaseDate!.slice(0, 4) : undefined })),
  )
  .sort((a, b) => b.len - a.len);

const CHARACTER_MATCHERS: Matcher[] = CHARACTERS.flatMap((c) =>
  [...new Set([...(c.matchTerms ?? []), c.civilName ?? ""])]
    .filter((t) => t.length >= 4)
    .map((t) => ({ id: c.id, re: wordRe(t), len: t.length })),
).sort((a, b) => b.len - a.len);

/** Les titres de productions sont cherchés en respectant la casse (titres propres). */
export function linkEntities(text: string): { productionIds: string[]; characterIds: string[] } {
  let rest = text;
  const productionIds = new Set<string>();
  for (const m of PRODUCTION_MATCHERS) {
    const hit = m.re.exec(rest);
    if (hit && m.year && !text.includes(m.year)) continue;
    if (hit) {
      productionIds.add(m.id);
      rest = rest.slice(0, hit.index) + " ".repeat(hit[0].length) + rest.slice(hit.index + hit[0].length);
    }
  }
  // Titres ambigus : uniquement sous forme « 'Titre' » / « “Titre” » (convention typographique des médias).
  for (const p of PRODUCTIONS) {
    if (p.kind === "comic" || productionIds.has(p.id)) continue;
    const t = p.originalTitle;
    if (!isAmbiguousTitle(t)) continue;
    if (new RegExp(`[‘'“"«]\\s?${escape(t)}\\s?[’'”"»]`).test(text) && p.continuity === "mcu") productionIds.add(p.id);
  }
  const characterIds = new Set<string>();
  for (const m of CHARACTER_MATCHERS) if (m.re.test(text)) characterIds.add(m.id);
  return { productionIds: [...productionIds], characterIds: [...characterIds] };
}

export function isMarvelRelevant(title: string, body: string, linked: { productionIds: string[]; characterIds: string[] }): boolean {
  const t = normalize(`${title} ${body}`);
  if (STRONG_TERMS.some((s) => wordRe(s).test(t))) return true;
  return linked.productionIds.length > 0;
}

/* ───────── Fiabilité ───────── */

const B = "(?<![\\p{L}\\p{N}])";
const E = "(?![\\p{L}\\p{N}])";
const kw = (alts: string) => new RegExp(`${B}(${alts})${E}`, "iu");
const THEORY_RE = kw("fan[- ]theor(?:y|ies)|theor(?:y|ies)|théories?|theories?|hypothèses?|speculat(?:e|ion|ing)|spéculations?");
const RUMOR_RE = kw("rumou?rs?|rumeurs?|rumou?red|leaks?|leaked|fuites?|insiders?|scoop|unconfirmed|non confirmée?s?|allegedly|serait en (?:discussion|négociation)s?|il se murmure|bruits? de couloir");

export function classifyReliability(source: Pick<NewsSource, "tier" | "name">, title: string, body: string): { reliability: Reliability; reason: string } {
  if (source.tier === "officielle") {
    return { reliability: "officiel", reason: `Publié directement par une source officielle (${source.name}).` };
  }
  if (source.tier === "fan") {
    return { reliability: THEORY_RE.test(title) ? "theorie" : "rumeur", reason: "Source communautaire non professionnelle." };
  }
  if (THEORY_RE.test(title)) return { reliability: "theorie", reason: `Le titre présente une théorie ou une spéculation (${source.name}).` };
  // Seuls le titre et la première phrase (l'information principale) déterminent le statut.
  const lead = body.slice(0, 400).split(/(?<=[.!?])\s/)[0] ?? "";
  if (RUMOR_RE.test(title) || RUMOR_RE.test(lead)) {
    return { reliability: "rumeur", reason: `L'article présente l'information comme une rumeur ou une fuite non confirmée (${source.name}).` };
  }
  return { reliability: "reporte", reason: `Rapporté par un média identifiable (${source.name}), sans confirmation officielle directe dans nos sources.` };
}

/* ───────── Catégories ───────── */

const CATEGORY_RULES: [NewsCategory, RegExp][] = [
  ["marvel-studios", kw("marvel studios|kevin feige|louis d'esposito")],
  ["casting", kw("cast(s|ing)?|joins?|star(s|ring)? (in|as)|to play|role|recast|rejoint|incarner[ao]?|interpr[èé]t(e|era)|au casting|distribution")],
  ["realisation", kw("direct(or|s|ed|ing)|to direct|filmmaker|réalis(ateur|atrice|era|é par)")],
  ["production", kw("filming|shoot(ing)?|production|wrap(s|ped)?|reshoots?|box office|tournage|budget|delay(ed)?|report[ée]|release date|date de sortie|postponed")],
  ["comics", kw("comics?(?![- ]?con)|issue #|graphic novel|bande dessinée|bd")],
  ["animation", kw("animat(ed|ion)|anim[ée]e?|cartoon|spider-verse|what if")],
  ["jeux-video", kw("video ?games?|jeux? vidéo|playstation|ps5|xbox|nintendo|switch 2|steam|marvel rivals|insomniac|gameplay")],
  ["series", kw("series|season|episode|disney\\+|showrunner|série|saison|épisode")],
  ["films", kw("film|movie|sequel|box office|long[- ]métrage")],
  ["bandes-annonces", kw("trailer|teaser|bande[- ]annonce|first look|featurette|sneak peek|clip")],
  ["disney-marvel", kw("disney|bob iger|d23|walt disney")],
];

export function categorize(source: Pick<NewsSource, "id">, title: string, body: string, linkedProductionIds: string[], isTrailer: boolean): NewsCategory[] {
  const text = `${title} ${body.slice(0, 600)}`;
  const cats = new Set<NewsCategory>();
  for (const [cat, re] of CATEGORY_RULES) if (re.test(cat === "casting" || cat === "realisation" ? title : text)) cats.add(cat);
  const linked = linkedProductionIds.map((id) => PRODUCTIONS.find((p) => p.id === id)).filter(Boolean);
  if (linked.some((p) => p!.continuity === "mcu") || /\bmcu\b/i.test(text)) cats.add("mcu");
  if (linked.some((p) => p!.kind === "film")) cats.add("films");
  if (linked.some((p) => p!.kind === "serie")) cats.add("series");
  if (linked.some((p) => p!.kind === "serie-animee" || p!.kind === "film-anime")) cats.add("animation");
  if (linked.some((p) => p!.kind === "jeu-video")) cats.add("jeux-video");
  if (source.id === "disney-company" || source.id === "d23") cats.add("disney-marvel");
  if (isTrailer) cats.add("bandes-annonces");
  return [...cats];
}

const TRAILER_RE = kw("official trailer|trailer|teaser|bande[- ]annonce|bandes[- ]annonces");
export function detectTrailer(title: string): boolean {
  return TRAILER_RE.test(title);
}

/* ───────── Résumé (extrait de la source) ───────── */

/** Extrait fidèle de la source, coupé proprement : jamais réécrit sans le signaler. */
export function excerpt(body: string, max = 420): string {
  const clean = body
    .replace(/\s*(The post .* appeared first on .*|L’article .* est apparu en premier sur .*|Read more.*|Lire la suite.*)$/i, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return lastStop > max * 0.5 ? cut.slice(0, lastStop + 1) : cut.replace(/\s+\S*$/, "") + "…";
}
