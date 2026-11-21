/**
 * Catalogue éditorial : point d'accès unique aux données de référence
 * (productions, personnages, personnes, chronologies, coulisses, quiz, calendrier).
 * Les index sont calculés une seule fois au chargement du module.
 */
import { MCU_PRODUCTIONS } from "@/data/productions-mcu";
import { EXTENDED_PRODUCTIONS } from "@/data/productions-extended";
import { CHARACTERS } from "@/data/characters";
import { BEHIND_THE_SCENES, BTS_CATEGORIES } from "@/data/behind-the-scenes";
import { ERAS, TIMELINE, UNIVERSES } from "@/data/timeline";
import { QUIZ } from "@/data/quiz";
import { EVENTS } from "@/data/events";
import verification from "@/data/verification.json";
import type { CalendarEntry, Character, Person, PersonRole, Production, SourceRef } from "./types";
import { slugify } from "./text";

export const PRODUCTIONS: Production[] = [...MCU_PRODUCTIONS, ...EXTENDED_PRODUCTIONS].map((p) => ({
  ...p,
  sources: p.sources?.length ? p.sources : wikiSources(p.wikipedia),
}));

function wikiSources(w?: { fr?: string; en?: string }): SourceRef[] {
  const out: SourceRef[] = [];
  if (w?.fr) out.push({ label: "Wikipédia (FR)", url: `https://fr.wikipedia.org/wiki/${encodeURI(w.fr)}` });
  if (w?.en) out.push({ label: "Wikipédia (EN)", url: `https://en.wikipedia.org/wiki/${encodeURI(w.en)}` });
  return out;
}

export const productionById = new Map(PRODUCTIONS.map((p) => [p.id, p]));
export const characterById = new Map(CHARACTERS.map((c) => [c.id, c]));

/* ───────── Personnes (dérivées des crédits) ───────── */

export interface PersonCredit {
  productionId: string;
  role: PersonRole;
  detail?: string;
}
export interface PersonEntry extends Person {
  credits: PersonCredit[];
}

const ROLE_FIELDS: [keyof Production, PersonRole][] = [
  ["directors", "realisateur"],
  ["writers", "scenariste"],
  ["composers", "compositeur"],
  ["producers", "producteur"],
  ["cinematographers", "directeur-photo"],
  ["editors", "monteur"],
  ["vfxSupervisors", "superviseur-vfx"],
];

function buildPeople(): Map<string, PersonEntry> {
  const map = new Map<string, PersonEntry>();
  const get = (name: string) => {
    const id = slugify(name);
    let e = map.get(id);
    if (!e) {
      e = { id, name, roles: [], credits: [] };
      map.set(id, e);
    }
    return e;
  };
  const add = (name: string, productionId: string, role: PersonRole, detail?: string) => {
    const e = get(name);
    if (!e.roles.includes(role)) e.roles.push(role);
    if (!e.credits.some((c) => c.productionId === productionId && c.role === role && c.detail === detail))
      e.credits.push({ productionId, role, detail });
  };
  for (const p of PRODUCTIONS) {
    for (const [field, role] of ROLE_FIELDS) for (const n of (p[field] as string[] | undefined) ?? []) add(n, p.id, role);
    for (const [n, role] of p.cast ?? []) add(n, p.id, "acteur", role);
  }
  // Personnes citées dans les coulisses (costumes, décors…) sans crédit de production structuré.
  const BTS_ROLES: Partial<Record<string, PersonRole>> = { costumes: "costumier", decors: "chef-decorateur", cascades: "cascadeur", montage: "monteur", cinematographie: "directeur-photo" };
  for (const b of BEHIND_THE_SCENES)
    for (const n of b.personIds ?? []) {
      const role = BTS_ROLES[b.category];
      if (role) for (const pid of b.productionIds) add(n, pid, role);
      else get(n);
    }
  for (const e of map.values()) e.credits.sort((a, b) => dateOf(a.productionId).localeCompare(dateOf(b.productionId)));
  return map;
}

function dateOf(id: string) {
  return productionById.get(id)?.releaseDate ?? "9999";
}

export const PEOPLE = buildPeople();
export const personBySlug = (id: string) => PEOPLE.get(id);
export const personSlug = slugify;

/* ───────── Personnages : productions associées ───────── */

export function productionsForCharacter(c: Character): Production[] {
  const ids = new Set(c.productions ?? []);
  for (const p of PRODUCTIONS) {
    if (p.characters?.includes(c.id)) ids.add(p.id);
    if (p.cast?.some(([, , cid]) => cid === c.id)) ids.add(p.id);
  }
  if (c.firstAppearance?.mcuProductionId) ids.add(c.firstAppearance.mcuProductionId);
  return [...ids].map((id) => productionById.get(id)).filter((p): p is Production => !!p).sort(byRelease);
}

export function charactersForProduction(p: Production): Character[] {
  const ids = new Set(p.characters ?? []);
  for (const [, , cid] of p.cast ?? []) if (cid) ids.add(cid);
  return [...ids].map((id) => characterById.get(id)).filter((c): c is Character => !!c);
}

export function relatedProductions(p: Production): { production: Production; nature: string }[] {
  const out = new Map<string, string>();
  for (const c of p.connections ?? []) out.set(c.productionId, c.nature);
  for (const other of PRODUCTIONS)
    for (const c of other.connections ?? []) if (c.productionId === p.id && !out.has(other.id)) out.set(other.id, c.nature);
  return [...out].map(([id, nature]) => ({ production: productionById.get(id)!, nature })).filter((x) => x.production);
}

/* ───────── Tri ───────── */

export function byRelease(a: Production, b: Production) {
  return (a.releaseDate ?? "9999").localeCompare(b.releaseDate ?? "9999");
}

/** Ordre narratif : position officielle si connue, sinon ère puis date de sortie. */
export function byNarrative(a: Production, b: Production) {
  const na = a.narrativeOrder ?? 1000;
  const nb = b.narrativeOrder ?? 1000;
  if (na !== nb) return na - nb;
  return byRelease(a, b);
}

/* ───────── Calendrier ───────── */

export function calendarEntries(): CalendarEntry[] {
  const out: CalendarEntry[] = [...EVENTS];
  for (const p of PRODUCTIONS) {
    if (!p.releaseDate || p.releaseDate.length < 10 || p.kind === "comic") continue;
    const isSeries = p.kind === "serie" || p.kind === "serie-animee";
    out.push({
      id: `sortie-${p.id}`,
      date: p.releaseDate,
      kind: isSeries ? "sortie-serie" : "sortie-film",
      title: p.title,
      productionId: p.id,
      certainty: p.dateCertainty,
      location: p.platform ?? (p.kind === "jeu-video" ? "Jeu vidéo" : "Cinéma (États-Unis)"),
      sources: p.sources ?? [],
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/* ───────── Vérification ───────── */

export interface VerificationRecord {
  checkedAt: string;
  status: "ok" | "ecart" | "introuvable" | "partiel";
  checks: { field: string; ours?: string; reference?: string; ok: boolean }[];
  referenceUrl?: string;
}

export function verificationFor(id: string): VerificationRecord | undefined {
  return (verification as { productions: Record<string, VerificationRecord> }).productions[id];
}
export const VERIFICATION_META = verification as { generatedAt: string | null; method: string | null };

export { CHARACTERS, BEHIND_THE_SCENES, BTS_CATEGORIES, ERAS, TIMELINE, UNIVERSES, QUIZ };
