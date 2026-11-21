"use client";
import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Lecteur YouTube léger : rien n'est chargé depuis YouTube avant le clic (vie privée, performances).
 * Utilise le domaine youtube-nocookie.com.
 */
export function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  const [on, setOn] = useState(false);
  if (!/^[\w-]{6,20}$/.test(id)) return null;
  return (
    <div className="panel relative aspect-video w-full overflow-hidden">
      {on ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        />
      ) : (
        <button onClick={() => setOn(true)} className="group absolute inset-0 flex items-center justify-center bg-ink-800" aria-label={`Lire : ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" loading="lazy" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-hq-red shadow-lg transition group-hover:scale-110"><Play className="h-7 w-7 fill-white text-white" /></span>
          <span className="absolute bottom-2 left-3 text-[10px] text-white/70">Lecture via YouTube (aucun cookie avant le clic)</span>
        </button>
      )}
    </div>
  );
}
