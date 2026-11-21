"use client";
/**
 * Bibliothèque personnelle, stockée localement dans le navigateur (localStorage).
 * Pas de compte requis en V1 ; export/import JSON pour sauvegarder ou changer d'appareil.
 * Toutes les lectures/écritures sont protégées (navigation privée, stockage bloqué…).
 */
import { useCallback, useSyncExternalStore } from "react";

export type WidgetId = "actus" | "officiel" | "rumeurs" | "sorties" | "bandes-annonces" | "favoris" | "evenements" | "ajouts" | "populaires";

export interface SavedArticle { id: string; title: string; url: string; source: string; savedAt: string }
export interface HistoryItem { kind: "production" | "personnage" | "personne" | "article"; id: string; title: string; href: string; at: string }

export interface LibraryState {
  version: 1;
  favorites: string[]; // productions
  followedCharacters: string[];
  watched: Record<string, string>; // productionId → date ISO
  watchlist: string[];
  progress: Record<string, number>; // productionId → épisodes vus
  ratings: Record<string, number>; // 1..10
  notes: Record<string, string>;
  savedArticles: SavedArticle[];
  history: HistoryItem[];
  prefs: { spoilerFree: boolean; widgets: { id: WidgetId; visible: boolean }[] };
  filters: Record<string, Record<string, string>>;
}

export const DEFAULT_WIDGETS: { id: WidgetId; visible: boolean }[] = [
  { id: "sorties", visible: true },
  { id: "officiel", visible: true },
  { id: "actus", visible: true },
  { id: "bandes-annonces", visible: true },
  { id: "rumeurs", visible: true },
  { id: "favoris", visible: true },
  { id: "evenements", visible: true },
  { id: "ajouts", visible: true },
  { id: "populaires", visible: true },
];

const KEY = "marvelhq:library:v1";

const EMPTY: LibraryState = {
  version: 1,
  favorites: [],
  followedCharacters: [],
  watched: {},
  watchlist: [],
  progress: {},
  ratings: {},
  notes: {},
  savedArticles: [],
  history: [],
  prefs: { spoilerFree: false, widgets: DEFAULT_WIDGETS },
  filters: {},
};

let cache: LibraryState | null = null;
const listeners = new Set<() => void>();

function sanitize(raw: unknown): LibraryState {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<LibraryState>;
  const arr = <T,>(v: unknown, f: (x: unknown) => x is T): T[] => (Array.isArray(v) ? v.filter(f) : []);
  const isStr = (x: unknown): x is string => typeof x === "string";
  const rec = <T,>(v: unknown, f: (x: unknown) => x is T): Record<string, T> =>
    v && typeof v === "object" ? Object.fromEntries(Object.entries(v).filter(([, x]) => f(x))) : {};
  const isNum = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);
  const knownWidgets = new Set(DEFAULT_WIDGETS.map((w) => w.id));
  const widgets = arr(r.prefs?.widgets, (w): w is { id: WidgetId; visible: boolean } =>
    !!w && typeof w === "object" && knownWidgets.has((w as { id: WidgetId }).id));
  for (const d of DEFAULT_WIDGETS) if (!widgets.some((w) => w.id === d.id)) widgets.push(d);
  return {
    version: 1,
    favorites: arr(r.favorites, isStr),
    followedCharacters: arr(r.followedCharacters, isStr),
    watched: rec(r.watched, isStr),
    watchlist: arr(r.watchlist, isStr),
    progress: rec(r.progress, isNum),
    ratings: rec(r.ratings, isNum),
    notes: rec(r.notes, isStr),
    savedArticles: arr(r.savedArticles, (x): x is SavedArticle => !!x && typeof x === "object" && isStr((x as SavedArticle).id)),
    history: arr(r.history, (x): x is HistoryItem => !!x && typeof x === "object" && isStr((x as HistoryItem).id)).slice(0, 50),
    prefs: { spoilerFree: !!r.prefs?.spoilerFree, widgets },
    filters: rec(r.filters, (x): x is Record<string, string> => !!x && typeof x === "object"),
  };
}

function read(): LibraryState {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? sanitize(JSON.parse(raw)) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: LibraryState) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* stockage indisponible : l'état reste en mémoire pour la session */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useLibrary() {
  const state = useSyncExternalStore(subscribe, read, () => EMPTY);
  const update = useCallback((fn: (s: LibraryState) => LibraryState) => write(fn(read())), []);
  return { state, update };
}

/* ───── Actions ───── */

export const toggleIn = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [id, ...list]);

/** Lecture directe (hors rendu), utile dans les effets avant la fin de l'hydratation. */
export function readLibrary(): LibraryState {
  return read();
}

export function exportLibrary(): string {
  return JSON.stringify(read(), null, 2);
}

export function importLibrary(json: string): { ok: boolean; error?: string } {
  try {
    write(sanitize(JSON.parse(json)));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function resetLibrary() {
  write(EMPTY);
}

export function pushHistory(item: Omit<HistoryItem, "at">) {
  const s = read();
  const history = [{ ...item, at: new Date().toISOString() }, ...s.history.filter((h) => !(h.kind === item.kind && h.id === item.id))].slice(0, 50);
  write({ ...s, history });
}
