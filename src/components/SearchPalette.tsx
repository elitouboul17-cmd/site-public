"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, CornerDownLeft } from "lucide-react";
import type { SearchHit } from "@/lib/search";

const LABELS: Record<string, string> = {
  film: "Films", serie: "Séries", personnage: "Personnages", acteur: "Acteurs", realisateur: "Réalisateurs",
  compositeur: "Compositeurs", musique: "Musique", personne: "Équipes", article: "Articles", evenement: "Événements", comic: "Comics", jeu: "Jeux vidéo", coulisses: "Coulisses",
};

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
    else { setQ(""); setHits([]); }
  }, [open]);

  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=24`, { signal: ctrl.signal });
        const data = await res.json();
        setHits(data.hits ?? []);
        setActive(0);
      } catch { /* requête annulée */ } finally { setLoading(false); }
    }, 120);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  const groups = useMemo(() => {
    const m = new Map<string, SearchHit[]>();
    for (const h of hits) m.set(h.kind, [...(m.get(h.kind) ?? []), h]);
    return [...m];
  }, [hits]);
  const flat = groups.flatMap(([, h]) => h);

  const go = (href: string) => { onClose(); router.push(href); };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-[max(env(safe-area-inset-top),1rem)] md:pt-24" role="dialog" aria-modal="true" aria-label="Recherche globale">
      <button className="absolute inset-0 bg-black/75 backdrop-blur-sm" aria-label="Fermer la recherche" onClick={onClose} />
      <div className="panel hud-corners animate-fade-up relative w-full max-w-2xl overflow-hidden">
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <Search className="h-5 w-5 text-hq-red" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              if (e.key === "Enter") {
                if (flat[active]) go(flat[active].href);
                else if (q.trim()) go(`/recherche?q=${encodeURIComponent(q)}`);
              }
            }}
            placeholder="Films, séries, personnages, acteurs, articles…"
            className="h-14 flex-1 bg-transparent text-base text-white outline-none placeholder:text-steel-500"
            aria-label="Terme recherché"
            role="combobox"
            aria-expanded={flat.length > 0}
            aria-controls="search-results"
          />
          <button className="btn h-9 w-9 p-0" onClick={onClose} aria-label="Fermer"><X className="h-4 w-4" /></button>
        </div>
        <div id="search-results" role="listbox" className="scrollbar-thin max-h-[60dvh] overflow-y-auto p-2">
          {q.trim().length < 2 && <p className="px-3 py-6 text-center text-sm text-steel-500">Tapez au moins deux caractères. Astuce : <kbd className="rounded border border-white/10 px-1">Ctrl K</kbd> ou <kbd className="rounded border border-white/10 px-1">/</kbd> ouvre la recherche partout.</p>}
          {q.trim().length >= 2 && !loading && flat.length === 0 && <p className="px-3 py-6 text-center text-sm text-steel-500">Aucun résultat pour « {q} ».</p>}
          {groups.map(([kind, items]) => (
            <div key={kind} className="mb-2">
              <div className="eyebrow px-3 pt-2 pb-1">{LABELS[kind] ?? kind}</div>
              {items.map((h) => {
                const idx = flat.indexOf(h);
                return (
                  <button
                    key={`${h.kind}-${h.id}`}
                    role="option"
                    aria-selected={idx === active}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => go(h.href)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ${idx === active ? "bg-hq-red/15" : "hover:bg-white/5"}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-white">{h.title}</span>
                      <span className="block truncate text-xs text-steel-400">{h.subtitle}</span>
                    </span>
                    {idx === active && <CornerDownLeft className="h-4 w-4 text-steel-400" aria-hidden />}
                  </button>
                );
              })}
            </div>
          ))}
          {flat.length > 0 && (
            <button onClick={() => go(`/recherche?q=${encodeURIComponent(q)}`)} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-hq-red hover:bg-white/5">
              Voir tous les résultats pour « {q} » →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
