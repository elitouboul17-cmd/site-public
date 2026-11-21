import type { Production } from "@/lib/types";
import { CONTINUITY_LABELS, KIND_LABELS } from "@/lib/labels";

const PHASE_HUES: Record<number, number> = { 1: 0, 2: 18, 3: 350, 4: 265, 5: 200, 6: 32 };

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
  const hue = p.phase ? PHASE_HUES[p.phase] : (h % 360);
  const angle = 140 + (h % 80);
  const titleSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-sm" : "text-lg";
  return (
    <div
      role="img"
      aria-label={`Visuel généré pour ${p.title}`}
      className={`relative flex aspect-[2/3] w-full flex-col justify-between overflow-hidden rounded-lg border border-white/10 p-3 ${className}`}
      style={{
        background: `linear-gradient(${angle}deg, hsl(${hue} 70% 18%) 0%, hsl(${hue} 60% 8%) 55%, #07080a 100%)`,
      }}
    >
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-40 blur-2xl" style={{ background: `hsl(${hue} 90% 50%)` }} />
      <div className="relative flex items-center justify-between text-[9px] font-bold tracking-[0.2em] text-white/70 uppercase">
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
