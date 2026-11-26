import Link from "next/link";
import { Music2, ExternalLink } from "lucide-react";
import type { Production } from "@/lib/types";
import { FEATURED_TRACKS } from "@/data/music";
import { PLATFORMS, searchUrl, soundtrackQuery } from "@/lib/music";
import { personSlug } from "@/lib/catalog";
import { deezerAlbum, deezerTrack } from "@/lib/deezer";
import { DeezerPlayer } from "./DeezerPlayer";

/** Boutons « Écouter sur … » (liens de recherche, ouverts dans un nouvel onglet). */
export function ListenButtons({ query, compact = false, label }: { query: string; compact?: boolean; label: string }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Écouter ${label}`}>
      {PLATFORMS.map((pl) => (
        <a
          key={pl.id}
          href={searchUrl(pl.id, query)}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] font-semibold text-steel-100 transition hover:border-white/30 hover:text-white ${compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"}`}
          aria-label={`Rechercher « ${label} » sur ${pl.label} (nouvel onglet)`}
        >
          <span className="h-2 w-2 rounded-full" style={{ background: pl.color }} aria-hidden />
          {pl.label}
        </a>
      ))}
    </div>
  );
}

/** Section « Musique » d'une fiche de production. */
export function MusicSection({ p }: { p: Production }) {
  const tracks = FEATURED_TRACKS[p.id] ?? [];
  if (!p.composers?.length && !tracks.length) return null;
  return (
    <div className="space-y-3">
      {p.composers?.length ? (
        <div className="panel p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent,#e62429)_20%,transparent)]"><Music2 className="h-5 w-5 text-[var(--accent-text,#ff3b40)]" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Bande originale</p>
              <p className="text-xs text-steel-400">
                Musique composée par{" "}
                {p.composers.map((c, i) => (
                  <span key={c}>{i ? (i === p.composers!.length - 1 ? " et " : ", ") : ""}<Link href={`/equipes/${personSlug(c)}`} className="text-steel-200 hover:underline">{c}</Link></span>
                ))}
              </p>
              {deezerAlbum(p.id) && (
                <div className="mt-3"><DeezerPlayer kind="album" id={deezerAlbum(p.id)!.id} label={deezerAlbum(p.id)!.title} sub={deezerAlbum(p.id)!.artist} /></div>
              )}
              <div className="mt-3"><ListenButtons query={soundtrackQuery(p)} label={`la bande originale de ${p.title}`} /></div>
            </div>
          </div>
        </div>
      ) : null}
      {tracks.length > 0 && (
        <ul className="space-y-2">
          {tracks.map((t) => (
            <li key={t.title} className="panel space-y-2 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{t.title}</p>
                  <p className="truncate text-xs text-steel-400">{t.artist} · {t.role}</p>
                </div>
                <ListenButtons compact query={`${t.title} ${t.artist}`} label={`${t.title} de ${t.artist}`} />
              </div>
              {deezerTrack(p.id, t.title) && <DeezerPlayer kind="track" id={deezerTrack(p.id, t.title)!.id} label={t.title} sub={t.artist} />}
            </li>
          ))}
        </ul>
      )}
      <p className="flex items-center gap-1 text-[11px] text-steel-500">
        <ExternalLink className="h-3 w-3" /> Lecteur officiel Deezer (chargé seulement au clic) et liens vers les plateformes : la musique reste diffusée par elles, chez ses ayants droit.
      </p>
    </div>
  );
}
