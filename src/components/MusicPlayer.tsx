"use client";
import { useState } from "react";
import { Play } from "lucide-react";
import type { PlayerSource } from "@/lib/players";

const META = {
  deezer: { label: "Deezer", color: "#a238ff" },
  apple: { label: "Apple Music", color: "#fa2d48" },
} as const;

function embed(s: PlayerSource): { src: string; height: number; allow: string; sandbox: string } {
  if (s.platform === "deezer")
    return {
      src: `https://widget.deezer.com/widget/dark/${s.kind}/${s.id}${s.kind === "album" ? "?tracklist=true" : ""}`,
      height: s.kind === "album" ? 300 : 150,
      allow: "encrypted-media; clipboard-write",
      sandbox: "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox",
    };
  return {
    src: s.kind === "album" ? `https://embed.music.apple.com/fr/album/${s.id}` : `https://embed.music.apple.com/fr/album/${s.albumId}?i=${s.id}`,
    height: s.kind === "album" ? 450 : 175,
    allow: "autoplay *; encrypted-media *; clipboard-write",
    sandbox: "allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation",
  };
}

/**
 * Lecteur intégré multi-plateformes : onglets Deezer / Apple Music…, chargé seulement au clic.
 * Extrait pour tous ; écoute complète pour les abonnés connectés à la plateforme choisie.
 */
export function MusicPlayer({ sources, label, sub }: { sources: PlayerSource[]; label: string; sub?: string }) {
  const [active, setActive] = useState<PlayerSource["platform"] | null>(null);
  const valid = sources.filter((s) => Number.isInteger(s.id));
  if (!valid.length) return null;
  const current = valid.find((s) => s.platform === active);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label={`Écouter ${label}`}>
        {valid.map((s) => (
          <button
            key={s.platform}
            role="tab"
            aria-selected={active === s.platform}
            onClick={() => setActive(s.platform)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active === s.platform ? "border-white/40 bg-white/10 text-white" : "border-white/10 bg-white/[0.03] text-steel-200 hover:border-white/30"}`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: META[s.platform].color }}>
              <Play className="h-2.5 w-2.5 fill-white text-white" />
            </span>
            Écouter ici sur {META[s.platform].label}
          </button>
        ))}
      </div>
      {current ? (
        <iframe
          key={current.platform}
          title={`Lecteur ${META[current.platform].label} : ${label}`}
          src={embed(current).src}
          width="100%"
          height={embed(current).height}
          allow={embed(current).allow}
          sandbox={embed(current).sandbox}
          className="w-full rounded-lg border-0 bg-black/20"
          loading="lazy"
        />
      ) : (
        <p className="text-[11px] text-steel-500">{sub ? `${sub} · ` : ""}Extrait gratuit pour tous, écoute complète si vous êtes abonné et connecté à la plateforme. Rien n'est chargé avant le clic.</p>
      )}
    </div>
  );
}
