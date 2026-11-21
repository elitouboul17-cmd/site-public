/** Utilitaires texte partagés (serveur et client). */

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’'`]/g, "'")
    .trim();
}

export function slugify(s: string): string {
  return normalize(s)
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** Formate une date ISO complète ou partielle (yyyy, yyyy-mm, yyyy-mm-dd) en français. */
export function formatDate(iso?: string | null, opts: { short?: boolean } = {}): string {
  if (!iso) return "Date non confirmée";
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  if (!mo) return y;
  const month = MONTHS[Number(mo) - 1];
  if (!d) return `${month} ${y}`;
  if (opts.short) return `${Number(d)} ${month.slice(0, 4).replace(/\.$/, "")}. ${y}`;
  return `${Number(d) === 1 ? "1er" : Number(d)} ${month} ${y}`;
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" });
}

export function relativeTime(iso: string, now = Date.now()): string {
  const diff = (now - new Date(iso).getTime()) / 1000;
  if (Number.isNaN(diff)) return "";
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 30) return `il y a ${Math.floor(diff / 86400)} j`;
  return formatDate(iso.slice(0, 10));
}

export function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

/** Durée en minutes → « 2 h 06 ». */
export function formatRuntime(min?: number) {
  if (!min) return undefined;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} h ${String(m).padStart(2, "0")}` : `${m} min`;
}
