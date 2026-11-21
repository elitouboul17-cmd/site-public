import type { Production } from "@/lib/types";
import { CONTINUITY_LABELS, KIND_LABELS } from "@/lib/labels";
import { themeFor } from "@/lib/theme";

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Affiche : image TMDB si synchronisée (attribution affichée sur la fiche),
 * sinon visuel typographique original généré (aucune ressource protégée).
 */
export function Poster({ p, src, className = "", size = "md" }: { p: Production; src?: string; className?: string; size?: "sm" | "md" | "lg" }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={`Affiche : ${p.title}`} loading="lazy" decoding="async" className={`aspect-[2/3] w-full rounded-lg object-cover ${className}`} />
    );
  }
  const h = hash(p.id);
  const [c1, c2, c3] = themeFor(p).colors;
  const angle = 145 + (h % 50);
  const titleSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-sm" : "text-lg";
  return (
    <div
      role="img"
      aria-label={`Visuel généré pour ${p.title}`}
      className={`relative flex aspect-[2/3] w-full flex-col justify-between overflow-hidden rounded-lg border border-white/10 p-3 ${className}`}
      style={{
        background: `linear-gradient(${angle}deg, ${c1} 0%, color-mix(in srgb, ${c1} 45%, #07080a) 48%, #07080a 100%)`,
      }}
    >
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-50" />
      {/* Bande diagonale secondaire et filet d'accent : identité colorée de l'œuvre */}
      <div className="pointer-events-none absolute -inset-x-10 top-[58%] h-[22%] -rotate-12 opacity-80" style={{ background: `linear-gradient(90deg, transparent, ${c2} 30%, ${c2} 70%, transparent)` }} />
      <div className="pointer-events-none absolute -inset-x-10 top-[82%] h-[3%] -rotate-12" style={{ background: c3 }} />
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-50 blur-2xl" style={{ background: c2 }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 to-transparent" />
      <div className="relative flex items-center justify-between text-[9px] font-bold tracking-[0.2em] text-white/80 uppercase" style={{ textShadow: "0 1px 6px rgba(0,0,0,.85)" }}>
        <span>{p.phase ? `Phase ${p.phase}` : CONTINUITY_LABELS[p.continuity].short}</span>
        <span>{p.releaseDate?.slice(0, 4) ?? "TBA"}</span>
      </div>
      <div className="relative">
        <p className={`display leading-[0.95] text-white ${titleSize}`} style={{ textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>{p.title}</p>
        <p className="mt-1.5 text-[10px] font-semibold tracking-widest text-white/60 uppercase">{KIND_LABELS[p.kind]}</p>
      </div>
    </div>
  );
}
