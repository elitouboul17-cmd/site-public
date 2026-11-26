"use client";
import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Lecteur officiel Deezer, chargé uniquement au clic (rien n'est envoyé à Deezer avant).
 * Extrait de 30 s pour tous ; écoute complète pour les abonnés Deezer connectés.
 */
export function DeezerPlayer({ kind, id, label, sub }: { kind: "album" | "track"; id: number; label: string; sub?: string }) {
  const [on, setOn] = useState(false);
  const height = kind === "album" ? 300 : 150;
  if (!Number.isInteger(id)) return null;
  if (on) {
    return (
      <iframe
        title={`Lecteur Deezer : ${label}`}
        src={`https://widget.deezer.com/widget/dark/${kind}/${id}${kind === "album" ? "?tracklist=true" : ""}`}
        width="100%"
        height={height}
        allow="encrypted-media; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        className="w-full rounded-lg border-0"
        loading="lazy"
      />
    );
  }
  return (
    <button
      onClick={() => setOn(true)}
      className="group flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-[#a238ff]/60"
      aria-label={`Écouter ${label} avec le lecteur Deezer`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#a238ff] transition group-hover:scale-105">
        <Play className="h-4.5 w-4.5 fill-white text-white" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-white">Écouter ici : {label}</span>
        <span className="block truncate text-[11px] text-steel-400">{sub ?? "Lecteur Deezer"} · extrait de 30 s, ou en entier si vous êtes abonné Deezer</span>
      </span>
    </button>
  );
}
