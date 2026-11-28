"use client";
import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

const ORIGIN = "https://www.youtube-nocookie.com";

/**
 * Lecteur YouTube « fermé » : on regarde la vidéo choisie, et rien d'autre.
 * - Rien n'est chargé depuis YouTube avant le clic (vie privée, performances), domaine youtube-nocookie.com.
 * - Iframe en bac à sable SANS allow-popups ni allow-top-navigation : le logo YouTube, le titre,
 *   « Regarder sur YouTube » ou « Copier le lien » ne peuvent ouvrir ni YouTube, ni le navigateur, ni l'appli YouTube.
 * - Fin de vidéo : le lecteur est refermé avant l'écran de suggestions de YouTube.
 * - Si une autre vidéo démarre dans le lecteur (suggestion cliquée), il est refermé aussitôt.
 */
export function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  const [on, setOn] = useState(false);
  const [ended, setEnded] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!on) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== ORIGIN || e.source !== frame.current?.contentWindow) return;
      let data: { event?: string; info?: { playerState?: number; videoData?: { video_id?: string } } };
      try { data = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch { return; }
      const info = data?.info;
      if (!info) return;
      const otherVideo = info.videoData?.video_id && info.videoData.video_id !== id;
      if (info.playerState === 0 || otherVideo) { setOn(false); setEnded(true); }
    };
    window.addEventListener("message", onMessage);
    // Demande au lecteur d'envoyer ses changements d'état (API iframe de YouTube).
    const hello = () => frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: "qg", channel: "widget" }), ORIGIN);
    const timer = window.setInterval(hello, 1000);
    return () => { window.removeEventListener("message", onMessage); window.clearInterval(timer); };
  }, [on, id]);

  if (!/^[\w-]{6,20}$/.test(id)) return null;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <div className="panel relative aspect-video w-full overflow-hidden">
      {on ? (
        <iframe
          ref={frame}
          className="absolute inset-0 h-full w-full"
          src={`${ORIGIN}/embed/${id}?autoplay=1&rel=0&iv_load_policy=3&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
      ) : (
        <button onClick={() => { setEnded(false); setOn(true); }} className="group absolute inset-0 flex items-center justify-center bg-ink-800" aria-label={`${ended ? "Revoir" : "Lire"} : ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" loading="lazy" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-hq-red shadow-lg transition group-hover:scale-110">
            {ended ? <RotateCcw className="h-7 w-7 text-white" /> : <Play className="h-7 w-7 fill-white text-white" />}
          </span>
          <span className="absolute bottom-2 left-3 text-[10px] text-white/70">{ended ? "Vidéo terminée — appuie pour revoir" : "Lecture via YouTube (aucun cookie avant le clic)"}</span>
        </button>
      )}
    </div>
  );
}
