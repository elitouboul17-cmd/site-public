/** Règles de correspondance communes aux lecteurs intégrés (Deezer, Apple Music…). */
import { normalize } from "../../src/lib/text";

export const clean = (s: string) => normalize(s).replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
export const REJECT = /\b(unofficial|inspired|tribute|cover|covers|karaoke|lullaby|lullabies|piano|instrumental versions?|8 bit|8bit|remix(es)?|music box|epic version|orchestral tribute|ringtone|medley|allstar orchestra|all star orchestra|all-star orchestra|plays the music|performed by|re-?recorded|re-?recording)\b/i;
export const SOUNDTRACK = /\b(soundtrack|original score|score|music from|bande originale|ost|original motion picture|original series|original television)\b/i;

/** Le titre de l'œuvre est présent, mais pas suivi d'un numéro de suite (« Deadpool 2 » ≠ « Deadpool »). */
export function sameWork(albumTitle: string, workTitle: string) {
  const a = clean(albumTitle), w = clean(workTitle);
  const i = a.indexOf(w);
  if (i < 0) return false;
  const rest = a.slice(i + w.length);
  return !/^\s*(\d|ii\b|iii\b|iv\b|returns|reborn)/.test(rest);
}

/** Versions à écarter : on veut l'enregistrement original entendu dans l'œuvre. */
export const ALT_VERSION = /\b(demo|live|acoustic|remix|rehearsal|instrumental|karaoke|re-?recorded|sped up|slowed)\b/i;

/** Même chanson : titre identique, éventuellement suivi d'une mention entre parenthèses ou après un tiret, hors versions alternatives. */
export function sameSong(found: string, wanted: string) {
  const f = normalize(found).trim(), w = normalize(wanted).trim();
  if (!f.startsWith(w)) return false;
  const rest = f.slice(w.length);
  return /^\s*($|\(|\[|-)/.test(rest) && !ALT_VERSION.test(rest);
}

export function artistMatches(candidate: string, wanted: string[]) {
  const c = clean(candidate);
  return wanted.some((w) => {
    const x = clean(w);
    return c === x || c.includes(x) || x.includes(c);
  });
}

