import details from "@/data/tmdb-details.json";

export interface TmdbVideo { key: string; name: string; type: string; lang: string; published?: string }
export interface Provider { name: string; logo?: string }
export interface TmdbDetails {
  tmdbType: "movie" | "tv";
  tmdbId: string;
  budget?: number;
  revenue?: number;
  videos: TmdbVideo[];
  watch?: { link?: string; flatrate: Provider[]; rent: Provider[]; buy: Provider[]; free: Provider[] };
  fetchedAt: string;
}

const D = details as Record<string, TmdbDetails>;
export const detailsFor = (id: string): TmdbDetails | undefined => D[id];
export const allDetails = () => D;

export const VIDEO_TYPE_LABELS: Record<string, string> = {
  Trailer: "Bande-annonce",
  Teaser: "Teaser",
  "Behind the Scenes": "Coulisses",
  Featurette: "Coulisses / featurette",
  Clip: "Extrait",
};

/** 356000000 → « 356 M$ » ; 2942661253 → « 2,94 Md$ » (dollars US). */
export function formatUsd(n?: number) {
  if (!n) return "—";
  if (n >= 1e9) return `${(n / 1e9).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} Md$`;
  return `${Math.round(n / 1e6).toLocaleString("fr-FR")} M$`;
}
