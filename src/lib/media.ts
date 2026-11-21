import type { ProductionMedia } from "./db/repo";

/** URL d'affiche TMDB (images autorisées avec attribution, usage non commercial). */
export function posterUrl(m?: ProductionMedia, size: "w342" | "w500" | "w780" = "w342") {
  return m?.posterPath ? `https://image.tmdb.org/t/p/${size}${m.posterPath}` : undefined;
}
