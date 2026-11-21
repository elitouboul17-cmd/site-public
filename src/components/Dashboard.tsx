"use client";
import Link from "next/link";
import { useState } from "react";
import { Settings2, ArrowUp, ArrowDown, Eye, EyeOff, X } from "lucide-react";
import { useLibrary, DEFAULT_WIDGETS, type WidgetId } from "@/lib/library";

export const WIDGET_LABELS: Record<WidgetId, string> = {
  sorties: "Prochaines sorties",
  officiel: "Annonces officielles",
  actus: "Dernières actualités",
  "bandes-annonces": "Bandes-annonces récentes",
  rumeurs: "Rumeurs et théories",
  favoris: "Mes favoris",
  evenements: "Prochains événements",
  ajouts: "Sorties récentes",
  populaires: "Productions les plus citées",
};

/** Tableau de bord personnalisable : ordre et visibilité des modules mémorisés localement. */
export function Dashboard({ widgets }: { widgets: Partial<Record<WidgetId, React.ReactNode>> }) {
  const { state, update } = useLibrary();
  const [editing, setEditing] = useState(false);
  const order = state.prefs.widgets;

  const move = (id: WidgetId, dir: -1 | 1) =>
    update((s) => {
      const list = [...s.prefs.widgets];
      const i = list.findIndex((w) => w.id === id);
      const j = i + dir;
      if (j < 0 || j >= list.length) return s;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...s, prefs: { ...s.prefs, widgets: list } };
    });
  const toggle = (id: WidgetId) =>
    update((s) => ({ ...s, prefs: { ...s.prefs, widgets: s.prefs.widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w)) } }));

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button className="btn" onClick={() => setEditing((e) => !e)} aria-expanded={editing}>
          <Settings2 className="h-4 w-4" /> Personnaliser le QG
        </button>
      </div>
      {editing && (
        <div className="panel mb-6 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="display text-sm text-white">Modules du tableau de bord</p>
            <button className="btn h-8 w-8 p-0" onClick={() => setEditing(false)} aria-label="Fermer"><X className="h-4 w-4" /></button>
          </div>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {order.map((w, i) => (
              <li key={w.id} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                <span className={`flex-1 text-sm ${w.visible ? "text-white" : "text-steel-500 line-through"}`}>{WIDGET_LABELS[w.id]}</span>
                <button className="btn h-8 w-8 p-0" onClick={() => move(w.id, -1)} disabled={i === 0} aria-label="Monter"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button className="btn h-8 w-8 p-0" onClick={() => move(w.id, 1)} disabled={i === order.length - 1} aria-label="Descendre"><ArrowDown className="h-3.5 w-3.5" /></button>
                <button className="btn h-8 w-8 p-0" onClick={() => toggle(w.id)} aria-label={w.visible ? "Masquer" : "Afficher"}>{w.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
              </li>
            ))}
          </ul>
          <button className="mt-3 text-xs text-steel-400 hover:text-white" onClick={() => update((s) => ({ ...s, prefs: { ...s.prefs, widgets: DEFAULT_WIDGETS } }))}>Rétablir l'agencement par défaut</button>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        {order.filter((w) => w.visible && widgets[w.id]).map((w) => (
          <section key={w.id} className={`animate-fade-up ${w.id === "sorties" || w.id === "ajouts" || w.id === "populaires" || w.id === "favoris" ? "xl:col-span-2" : ""}`} aria-label={WIDGET_LABELS[w.id]}>
            {widgets[w.id]}
          </section>
        ))}
      </div>
    </div>
  );
}

export function FavoritesWidget({ items }: { items: { id: string; title: string; year?: string }[] }) {
  const { state } = useLibrary();
  const byId = new Map(items.map((i) => [i.id, i]));
  const favs = state.favorites.map((id) => byId.get(id)).filter(Boolean);
  const watch = state.watchlist.map((id) => byId.get(id)).filter(Boolean);
  const chars = state.followedCharacters;
  if (!favs.length && !watch.length && !chars.length)
    return <p className="panel p-4 text-sm text-steel-400">Aucun favori pour l'instant. Ajoutez des films, séries ou personnages depuis leur fiche : ils apparaîtront ici.</p>;
  return (
    <div className="panel grid gap-4 p-4 md:grid-cols-2">
      <div>
        <p className="eyebrow mb-2">Favoris</p>
        <div className="flex flex-wrap gap-1.5">
          {favs.length ? favs.map((p) => <Link key={p!.id} href={`/productions/${p!.id}`} className="chip hover:border-white/30">{p!.title}</Link>) : <span className="text-xs text-steel-500">—</span>}
        </div>
      </div>
      <div>
        <p className="eyebrow mb-2">À regarder ({watch.length})</p>
        <div className="flex flex-wrap gap-1.5">
          {watch.length ? watch.slice(0, 12).map((p) => <Link key={p!.id} href={`/productions/${p!.id}`} className="chip hover:border-white/30">{p!.title}</Link>) : <span className="text-xs text-steel-500">—</span>}
        </div>
      </div>
      {chars.length > 0 && (
        <div className="md:col-span-2">
          <p className="eyebrow mb-2">Personnages suivis</p>
          <div className="flex flex-wrap gap-1.5">
            {chars.map((id) => <Link key={id} href={`/actualites?personnage=${id}`} className="chip hover:border-white/30">Actus : {id.replace(/-/g, " ")}</Link>)}
          </div>
        </div>
      )}
    </div>
  );
}
