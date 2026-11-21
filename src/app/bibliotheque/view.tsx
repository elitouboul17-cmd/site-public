"use client";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Download, Upload, Trash2, ExternalLink, Star } from "lucide-react";
import { useLibrary, exportLibrary, importLibrary, resetLibrary, toggleIn } from "@/lib/library";
import { relativeTime } from "@/lib/text";

type P = { id: string; title: string; kind: string; continuity: string; releaseDate?: string; episodes?: number; phase?: number; status: string };
type C = { id: string; name: string };

const TABS = [
  { id: "progression", label: "Progression" },
  { id: "favoris", label: "Favoris" },
  { id: "a-regarder", label: "À regarder" },
  { id: "vus", label: "Vus" },
  { id: "notes", label: "Notes et avis" },
  { id: "articles", label: "Articles sauvegardés" },
  { id: "personnages", label: "Personnages suivis" },
  { id: "historique", label: "Historique" },
] as const;

export function LibraryView({ productions, characters }: { productions: P[]; characters: C[] }) {
  const { state, update } = useLibrary();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("progression");
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const byId = useMemo(() => new Map(productions.map((p) => [p.id, p])), [productions]);
  const charById = useMemo(() => new Map(characters.map((c) => [c.id, c])), [characters]);

  const mcuReleased = productions.filter((p) => p.continuity === "mcu" && p.status === "sorti");
  const mcuSeen = mcuReleased.filter((p) => state.watched[p.id]).length;
  const pct = mcuReleased.length ? Math.round((mcuSeen / mcuReleased.length) * 100) : 0;
  const seriesInProgress = productions.filter((p) => p.episodes && state.progress[p.id] && state.progress[p.id] < p.episodes!);

  const list = (ids: string[], empty: string) =>
    ids.length ? (
      <ul className="grid gap-2 sm:grid-cols-2">
        {ids.map((id) => byId.get(id)).filter(Boolean).map((p) => (
          <li key={p!.id} className="panel flex items-center justify-between gap-2 p-3">
            <Link href={`/productions/${p!.id}`} className="min-w-0 truncate text-sm font-semibold text-white hover:underline">{p!.title}</Link>
            <span className="shrink-0 text-xs text-steel-500">{p!.releaseDate?.slice(0, 4) ?? "—"}</span>
          </li>
        ))}
      </ul>
    ) : <p className="panel p-4 text-sm text-steel-400">{empty}</p>;

  const download = () => {
    const blob = new Blob([exportLibrary()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `marvelhq-bibliotheque-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Stat label="MCU vu" value={`${pct} %`} sub={`${mcuSeen} / ${mcuReleased.length} productions sorties`} bar={pct} />
        <Stat label="Favoris" value={String(state.favorites.length)} />
        <Stat label="À regarder" value={String(state.watchlist.length)} />
        <Stat label="Articles sauvegardés" value={String(state.savedArticles.length)} />
      </div>

      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`chip ${tab === t.id ? "chip-active" : ""}`}>{t.label}</button>
        ))}
      </div>

      {tab === "progression" && (
        <div className="space-y-6">
          <div>
            <p className="eyebrow mb-2">Séries en cours</p>
            {seriesInProgress.length ? (
              <ul className="space-y-2">
                {seriesInProgress.map((p) => (
                  <li key={p.id} className="panel p-3">
                    <div className="flex justify-between text-sm"><Link href={`/productions/${p.id}`} className="font-semibold text-white hover:underline">{p.title}</Link><span className="text-steel-400">{state.progress[p.id]} / {p.episodes}</span></div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-hq-red" style={{ width: `${(state.progress[p.id] / p.episodes!) * 100}%` }} /></div>
                  </li>
                ))}
              </ul>
            ) : <p className="panel p-4 text-sm text-steel-400">Aucune série en cours. Réglez votre progression depuis la fiche d'une série.</p>}
          </div>
          <div>
            <p className="eyebrow mb-2">Progression MCU par phase</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => {
                const items = mcuReleased.filter((p) => p.phase === n);
                const seen = items.filter((p) => state.watched[p.id]).length;
                if (!items.length) return null;
                return (
                  <div key={n} className="panel p-3">
                    <div className="flex justify-between text-sm"><span className="font-semibold text-white">Phase {n}</span><span className="text-steel-400">{seen}/{items.length}</span></div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-hq-red" style={{ width: `${(seen / items.length) * 100}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {tab === "favoris" && list(state.favorites, "Aucun favori. Utilisez « Ajouter aux favoris » sur une fiche.")}
      {tab === "a-regarder" && list(state.watchlist, "Votre liste est vide.")}
      {tab === "vus" && list(Object.keys(state.watched).sort((a, b) => state.watched[b].localeCompare(state.watched[a])), "Aucune production marquée comme vue.")}
      {tab === "notes" && (
        [...new Set([...Object.keys(state.ratings), ...Object.keys(state.notes)])].length ? (
          <ul className="space-y-2">
            {[...new Set([...Object.keys(state.ratings), ...Object.keys(state.notes)])].map((id) => byId.get(id) && (
              <li key={id} className="panel p-3">
                <div className="flex items-center justify-between"><Link href={`/productions/${id}`} className="text-sm font-semibold text-white hover:underline">{byId.get(id)!.title}</Link>{state.ratings[id] && <span className="flex items-center gap-1 text-sm text-hq-red"><Star className="h-3.5 w-3.5 fill-hq-red" />{state.ratings[id]}/10</span>}</div>
                {state.notes[id] && <p className="mt-1 text-sm whitespace-pre-wrap text-steel-300">{state.notes[id]}</p>}
              </li>
            ))}
          </ul>
        ) : <p className="panel p-4 text-sm text-steel-400">Aucune note pour l'instant.</p>
      )}
      {tab === "articles" && (
        state.savedArticles.length ? (
          <ul className="space-y-2">
            {state.savedArticles.map((a) => (
              <li key={a.id} className="panel flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1"><Link href={`/actualites/${a.id}`} className="block truncate text-sm font-semibold text-white hover:underline">{a.title}</Link><span className="text-xs text-steel-500">{a.source} · sauvegardé {relativeTime(a.savedAt)}</span></div>
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="btn h-9 w-9 p-0" aria-label="Article original"><ExternalLink className="h-4 w-4" /></a>
                <button className="btn h-9 w-9 p-0" aria-label="Retirer" onClick={() => update((s) => ({ ...s, savedArticles: s.savedArticles.filter((x) => x.id !== a.id) }))}><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        ) : <p className="panel p-4 text-sm text-steel-400">Aucun article sauvegardé.</p>
      )}
      {tab === "personnages" && (
        state.followedCharacters.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {state.followedCharacters.map((id) => (
              <li key={id} className="panel flex items-center justify-between gap-2 p-3">
                <Link href={`/personnages/${id}`} className="text-sm font-semibold text-white hover:underline">{charById.get(id)?.name ?? id}</Link>
                <span className="flex gap-1">
                  <Link href={`/actualites?personnage=${id}`} className="chip hover:border-white/30">Actualités</Link>
                  <button className="chip" onClick={() => update((s) => ({ ...s, followedCharacters: toggleIn(s.followedCharacters, id) }))}>Ne plus suivre</button>
                </span>
              </li>
            ))}
          </ul>
        ) : <p className="panel p-4 text-sm text-steel-400">Vous ne suivez aucun personnage.</p>
      )}
      {tab === "historique" && (
        state.history.length ? (
          <ul className="panel divide-y divide-white/5">
            {state.history.map((h) => (
              <li key={h.kind + h.id} className="flex items-center justify-between gap-2 p-3 text-sm">
                <Link href={h.href} className="min-w-0 truncate text-white hover:underline">{h.title}</Link>
                <span className="shrink-0 text-xs text-steel-500">{h.kind} · {relativeTime(h.at)}</span>
              </li>
            ))}
          </ul>
        ) : <p className="panel p-4 text-sm text-steel-400">Historique vide.</p>
      )}

      <section className="panel mt-10 p-4">
        <p className="display mb-2 text-sm text-white">Sauvegarde</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={download}><Download className="h-4 w-4" /> Exporter (JSON)</button>
          <button className="btn" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Importer</button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > 2_000_000) { setMsg("Fichier trop volumineux."); return; }
            const r = importLibrary(await f.text());
            setMsg(r.ok ? "Bibliothèque importée." : `Import impossible : ${r.error}`);
            e.target.value = "";
          }} />
          <button className="btn" onClick={() => update((s) => ({ ...s, history: [] }))}>Effacer l'historique</button>
          <button className="btn border-hq-red/40 text-hq-red" onClick={() => { if (confirm("Effacer toute la bibliothèque de ce navigateur ? Cette action est irréversible.")) resetLibrary(); }}><Trash2 className="h-4 w-4" /> Tout effacer</button>
        </div>
        {msg && <p className="mt-2 text-xs text-steel-300" role="status">{msg}</p>}
      </section>
    </div>
  );
}

function Stat({ label, value, sub, bar }: { label: string; value: string; sub?: string; bar?: number }) {
  return (
    <div className="panel p-4">
      <p className="eyebrow">{label}</p>
      <p className="display mt-1 text-3xl text-white">{value}</p>
      {sub && <p className="text-xs text-steel-400">{sub}</p>}
      {bar != null && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-hq-red" style={{ width: `${bar}%` }} /></div>}
    </div>
  );
}
