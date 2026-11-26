import { photoFor } from "@/lib/photos";
import { RemoteImage } from "./RemoteImage";

function initials(name: string) {
  return name.split(/[\s.-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

/**
 * Portrait d'une personne : photo libre (Wikimedia Commons) si disponible, sinon initiales.
 * Le crédit (auteur, licence) est dans l'infobulle ; la fiche personne l'affiche en clair.
 */
export function PersonAvatar({ id, name, size = 40, className = "" }: { id: string; name: string; size?: number; className?: string }) {
  const photo = photoFor(id);
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-[11px] font-bold text-steel-300 ${className}`}
      style={{ width: size, height: size }}
      title={photo ? `Photo : ${photo.author} — ${photo.license} (Wikimedia Commons)` : undefined}
      aria-hidden
    >
      {initials(name)}
      {photo && <RemoteImage src={photo.src} className="absolute inset-0 h-full w-full object-cover object-top" />}
    </span>
  );
}

/** Crédit complet d'une photo, obligatoire pour les licences Creative Commons. */
export function PhotoCredit({ id }: { id: string }) {
  const p = photoFor(id);
  if (!p) return null;
  return (
    <p className="text-[10px] leading-snug text-steel-500">
      Photo : {p.author} —{" "}
      {p.licenseUrl ? <a href={p.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-steel-300">{p.license}</a> : p.license}
      {" "}— <a href={p.filePage} target="_blank" rel="noopener noreferrer" className="underline hover:text-steel-300">Wikimedia Commons</a>
    </p>
  );
}
