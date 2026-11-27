"use client";
import { useState } from "react";
import { Play } from "lucide-react";
import { YouTubeEmbed } from "./YouTubeEmbed";

type V = { key: string; name: string; type: string; lang: string; published?: string };
const LABELS: Record<string, string> = { Trailer: "Bande-annonce", Teaser: "Teaser", "Behind the Scenes": "Coulisses", Featurette: "Coulisses", Clip: "Extrait" };

/** Galerie de vidéos YouTube officielles : un lecteur principal + vignettes à choisir. Rien n'est chargé depuis YouTube avant le clic. */
export function VideoGallery({ videos, title }: { videos: V[]; title: string }) {
  const [current, setCurrent] = useState(0);
  const [filter, setFilter] = useState<string>("tout");
  if (!videos.length) return null;
  const types = [...new Set(videos.map((v) => LABELS[v.type] ?? v.type))];
  const shown = videos.filter((v) => filter === "tout" || (LABELS[v.type] ?? v.type) === filter);
  const active = videos[current];

  return (
    <div className="space-y-3">
      <YouTubeEmbed key={active.key} id={active.key} title={`${active.name} — ${title}`} />
      <p className="text-sm font-semibold text-white">{active.name} <span className="ml-1 text-xs font-normal text-steel-400">{LABELS[active.type] ?? active.type} · {active.lang === "fr" ? "Français" : active.lang === "en" ? "Anglais" : active.lang?.toUpperCase()}{active.published ? ` · ${active.published.slice(0, 4)}` : ""}</span></p>
      {types.length > 1 && (
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {["tout", ...types].map((t) => (
            <button key={t} onClick={() => setFilter(t)} className={`chip ${filter === t ? "chip-active" : ""}`}>{t === "tout" ? `Toutes (${videos.length})` : t}</button>
          ))}
        </div>
      )}
      <ul className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {shown.map((v) => {
          const idx = videos.indexOf(v);
          return (
            <li key={v.key} className="w-44 shrink-0">
              <button onClick={() => setCurrent(idx)} className={`group block w-full text-left ${idx === current ? "opacity-100" : "opacity-80 hover:opacity-100"}`} aria-label={`Lire : ${v.name}`} aria-current={idx === current}>
                <span className={`relative block aspect-video overflow-hidden rounded-md border ${idx === current ? "border-[var(--accent,#e62429)]" : "border-white/10"}`}>
                  {/* Miniature servie par YouTube (i.ytimg.com), sans cookie */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://i.ytimg.com/vi/${v.key}/mqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25"><Play className="h-6 w-6 fill-white text-white" /></span>
                </span>
                <span className="mt-1 line-clamp-2 block text-[11px] leading-snug text-steel-200">{v.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] text-steel-500">Vidéos officielles publiées sur YouTube (liste fournie par TMDB). Lecture via youtube-nocookie.com, rien n'est chargé avant le clic.</p>
    </div>
  );
}
