import { PRODUCTIONS, CHARACTERS, PEOPLE, BEHIND_THE_SCENES, calendarEntries } from "./catalog";
import { CONTINUITY_LABELS, KIND_LABELS, ROLE_LABELS } from "./labels";
import { normalize } from "./text";

export type SearchKind = "film" | "serie" | "personnage" | "acteur" | "realisateur" | "compositeur" | "personne" | "article" | "evenement" | "comic" | "jeu" | "coulisses";

export interface SearchHit {
  kind: SearchKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  score: number;
}

export const SEARCH_KIND_LABELS: Record<SearchKind, string> = {
  film: "Films", serie: "Séries", personnage: "Personnages", acteur: "Acteurs", realisateur: "Réalisateurs",
  compositeur: "Compositeurs", personne: "Équipes", article: "Articles", evenement: "Événements", comic: "Comics", jeu: "Jeux vidéo", coulisses: "Coulisses",
};

interface IndexEntry extends Omit<SearchHit, "score"> {
  primary: string[]; // normalisés
  secondary: string; // normalisé
}

function buildIndex(): IndexEntry[] {
  const out: IndexEntry[] = [];
  for (const p of PRODUCTIONS) {
    const kind: SearchKind =
      p.kind === "comic" ? "comic" : p.kind === "jeu-video" ? "jeu" : p.kind === "serie" || p.kind === "serie-animee" ? "serie" : "film";
    out.push({
      kind, id: p.id, title: p.title, href: `/productions/${p.id}`,
      subtitle: `${KIND_LABELS[p.kind]} · ${CONTINUITY_LABELS[p.continuity].short}${p.releaseDate ? " · " + p.releaseDate.slice(0, 4) : ""}`,
      primary: [p.title, p.originalTitle].map(normalize),
      secondary: normalize([p.synopsis, ...(p.directors ?? []), ...(p.cast ?? []).map((c) => `${c[0]} ${c[1]}`)].join(" ")),
    });
  }
  for (const c of CHARACTERS) {
    out.push({
      kind: "personnage", id: c.id, title: c.name, href: `/personnages/${c.id}`,
      subtitle: [c.civilName, ...(c.portrayals ?? []).slice(0, 2).map((p) => p.person)].filter(Boolean).join(" · "),
      primary: [c.name, c.civilName ?? "", ...(c.aliases ?? []), ...(c.matchTerms ?? [])].filter(Boolean).map(normalize),
      secondary: normalize([c.description, ...(c.portrayals ?? []).map((p) => p.person)].join(" ")),
    });
  }
  for (const p of PEOPLE.values()) {
    const kind: SearchKind = p.roles.includes("realisateur") ? "realisateur" : p.roles.includes("compositeur") ? "compositeur" : p.roles.includes("acteur") ? "acteur" : "personne";
    out.push({
      kind, id: p.id, title: p.name, href: `/equipes/${p.id}`,
      subtitle: `${p.roles.map((r) => ROLE_LABELS[r]).join(", ")} · ${new Set(p.credits.map((c) => c.productionId)).size} production(s)`,
      primary: [normalize(p.name)], secondary: "",
    });
  }
  for (const b of BEHIND_THE_SCENES)
    out.push({ kind: "coulisses", id: b.id, title: b.title, href: `/coulisses#${b.id}`, subtitle: "Coulisses", primary: [normalize(b.title)], secondary: normalize(b.summary) });
  for (const e of calendarEntries().filter((e) => e.kind === "convention" || e.kind === "evenement"))
    out.push({ kind: "evenement", id: e.id, title: e.title, href: `/calendrier#${e.id}`, subtitle: `Événement · ${e.date}`, primary: [normalize(e.title)], secondary: "" });
  return out;
}

let INDEX: IndexEntry[] | null = null;

export function scoreText(q: string, primary: string[], secondary: string): number {
  let best = 0;
  const tokens = q.split(/\s+/).filter(Boolean);
  for (const t of primary) {
    if (!t) continue;
    if (t === q) best = Math.max(best, 100);
    else if (t.startsWith(q)) best = Math.max(best, 80);
    else if (t.split(/[\s:\-/.]+/).some((w) => w.startsWith(q))) best = Math.max(best, 65);
    else if (t.includes(q)) best = Math.max(best, 50);
    else if (tokens.length > 1 && tokens.every((tok) => t.includes(tok))) best = Math.max(best, 45);
  }
  if (!best && secondary) {
    if (secondary.includes(q)) best = 20;
    else if (tokens.length > 1 && tokens.every((tok) => secondary.includes(tok))) best = 12;
  }
  return best;
}

export function searchCatalog(query: string, limit = 40): SearchHit[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  INDEX ??= buildIndex();
  const hits: SearchHit[] = [];
  for (const e of INDEX) {
    const s = scoreText(q, e.primary, e.secondary);
    if (s > 0) hits.push({ kind: e.kind, id: e.id, title: e.title, subtitle: e.subtitle, href: e.href, score: s });
  }
  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "fr")).slice(0, limit);
}
