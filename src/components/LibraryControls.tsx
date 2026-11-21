"use client";
import { useEffect, useState } from "react";
import { Heart, Check, Bookmark, BookmarkCheck, ListPlus, ListChecks, Star, BellRing, Bell } from "lucide-react";
import { useLibrary, toggleIn, pushHistory, type HistoryItem } from "@/lib/library";

export function WatchedDot({ id }: { id: string }) {
  const { state } = useLibrary();
  if (!state.watched[id]) return null;
  return (
    <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-officiel text-black shadow" title="Vu">
      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
      <span className="sr-only">Vu</span>
    </span>
  );
}

export function ProductionLibraryControls({ id, episodes }: { id: string; episodes?: number }) {
  const { state, update } = useLibrary();
  const fav = state.favorites.includes(id);
  const watched = !!state.watched[id];
  const inList = state.watchlist.includes(id);
  const rating = state.ratings[id] ?? 0;
  const progress = state.progress[id] ?? 0;
  const [note, setNote] = useState("");
  useEffect(() => setNote(state.notes[id] ?? ""), [id, state.notes]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button className={`btn ${fav ? "border-hq-red/70 bg-hq-red/15" : ""}`} aria-pressed={fav} onClick={() => update((s) => ({ ...s, favorites: toggleIn(s.favorites, id) }))}>
          <Heart className={`h-4 w-4 ${fav ? "fill-hq-red text-hq-red" : ""}`} /> {fav ? "Favori" : "Ajouter aux favoris"}
        </button>
        <button
          className={`btn ${watched ? "border-officiel/60 bg-officiel/10" : ""}`}
          aria-pressed={watched}
          onClick={() =>
            update((s) => {
              const w = { ...s.watched };
              if (w[id]) delete w[id];
              else w[id] = new Date().toISOString();
              return { ...s, watched: w, watchlist: w[id] ? s.watchlist.filter((x) => x !== id) : s.watchlist, progress: w[id] && episodes ? { ...s.progress, [id]: episodes } : s.progress };
            })
          }
        >
          <Check className={`h-4 w-4 ${watched ? "text-officiel" : ""}`} /> {watched ? "Vu" : "Marquer comme vu"}
        </button>
        <button className={`btn ${inList ? "border-arc/50 bg-arc/10" : ""}`} aria-pressed={inList} onClick={() => update((s) => ({ ...s, watchlist: toggleIn(s.watchlist, id) }))}>
          {inList ? <ListChecks className="h-4 w-4 text-arc" /> : <ListPlus className="h-4 w-4" />} {inList ? "Dans ma liste" : "À regarder"}
        </button>
      </div>

      <div>
        <p className="eyebrow mb-1.5">Ma note</p>
        <div className="flex items-center gap-0.5" role="radiogroup" aria-label="Note personnelle sur 10">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} sur 10`}
              className="p-1"
              onClick={() => update((s) => {
                const r = { ...s.ratings };
                if (r[id] === n) delete r[id]; else r[id] = n;
                return { ...s, ratings: r };
              })}
            >
              <Star className={`h-4.5 w-4.5 ${n <= rating ? "fill-hq-red text-hq-red" : "text-steel-500"}`} />
            </button>
          ))}
          <span className="ml-2 text-xs text-steel-400">{rating ? `${rating}/10` : "—"}</span>
        </div>
      </div>

      {episodes ? (
        <div>
          <label className="eyebrow mb-1.5 block" htmlFor={`progress-${id}`}>Progression : {progress}/{episodes} épisodes</label>
          <input
            id={`progress-${id}`}
            type="range"
            min={0}
            max={episodes}
            value={progress}
            onChange={(e) => {
              const v = Number(e.target.value);
              update((s) => ({ ...s, progress: { ...s.progress, [id]: v }, watched: v === episodes ? { ...s.watched, [id]: s.watched[id] ?? new Date().toISOString() } : s.watched }));
            }}
            className="w-full accent-[var(--accent,#e62429)]"
          />
        </div>
      ) : null}

      <div>
        <label className="eyebrow mb-1.5 block" htmlFor={`note-${id}`}>Mes notes</label>
        <textarea
          id={`note-${id}`}
          className="input min-h-20 text-sm"
          value={note}
          placeholder="Impressions, théories personnelles, détails à retenir…"
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => update((s) => ({ ...s, notes: note.trim() ? { ...s.notes, [id]: note } : Object.fromEntries(Object.entries(s.notes).filter(([k]) => k !== id)) }))}
          maxLength={5000}
        />
        <p className="mt-1 text-[11px] text-steel-500">Enregistré dans ce navigateur uniquement.</p>
      </div>
    </div>
  );
}

export function FollowCharacterButton({ id }: { id: string }) {
  const { state, update } = useLibrary();
  const on = state.followedCharacters.includes(id);
  return (
    <button className={`btn ${on ? "border-hq-red/70 bg-hq-red/15" : ""}`} aria-pressed={on} onClick={() => update((s) => ({ ...s, followedCharacters: toggleIn(s.followedCharacters, id) }))}>
      {on ? <BellRing className="h-4 w-4 text-hq-red" /> : <Bell className="h-4 w-4" />} {on ? "Suivi" : "Suivre ce personnage"}
    </button>
  );
}

export function SaveArticleButton({ a }: { a: { id: string; title: string; url: string; source: string } }) {
  const { state, update } = useLibrary();
  const saved = state.savedArticles.some((x) => x.id === a.id);
  return (
    <button
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-steel-400 hover:bg-white/5 hover:text-white"
      aria-pressed={saved}
      aria-label={saved ? "Retirer des articles sauvegardés" : "Sauvegarder l'article"}
      title={saved ? "Sauvegardé" : "Sauvegarder"}
      onClick={(e) => {
        e.preventDefault();
        update((s) => ({
          ...s,
          savedArticles: saved ? s.savedArticles.filter((x) => x.id !== a.id) : [{ ...a, savedAt: new Date().toISOString() }, ...s.savedArticles],
        }));
      }}
    >
      {saved ? <BookmarkCheck className="h-4.5 w-4.5 text-hq-red" /> : <Bookmark className="h-4.5 w-4.5" />}
    </button>
  );
}

/** Enregistre la consultation dans l'historique local. */
export function TrackView(props: Omit<HistoryItem, "at">) {
  useEffect(() => {
    pushHistory(props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.kind, props.id]);
  return null;
}

/** Masque un contenu sensible en mode sans spoilers, sauf si la production est marquée vue. */
export function SpoilerGuard({ productionIds = [], children, label = "Contenu masqué (mode sans spoilers)", force = false }: { productionIds?: string[]; children: React.ReactNode; label?: string; force?: boolean }) {
  const { state } = useLibrary();
  const [revealed, setRevealed] = useState(false);
  const seen = productionIds.length > 0 && productionIds.every((id) => state.watched[id]);
  const hide = state.prefs.spoilerFree && (force || !seen) && !revealed;
  if (!hide) return <>{children}</>;
  return (
    <div className="relative">
      <div className="spoiler-blur pointer-events-none" aria-hidden>{children}</div>
      <button onClick={() => setRevealed(true)} className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 text-xs font-semibold text-steel-200 hover:text-white">
        {label} — afficher
      </button>
    </div>
  );
}
