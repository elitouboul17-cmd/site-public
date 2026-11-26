import type { Production } from "./types";

export type MusicPlatform = "spotify" | "youtube-music" | "deezer" | "apple-music";

export const PLATFORMS: { id: MusicPlatform; label: string; color: string }[] = [
  { id: "spotify", label: "Spotify", color: "#1db954" },
  { id: "youtube-music", label: "YouTube Music", color: "#ff0033" },
  { id: "deezer", label: "Deezer", color: "#a238ff" },
  { id: "apple-music", label: "Apple Music", color: "#fa2d48" },
];

/**
 * Lien de RECHERCHE sur la plateforme : toujours valide, jamais une adresse devinée.
 * (Des liens directs vers l'album exact pourront être ajoutés via l'API Spotify, vérifiés.)
 */
export function searchUrl(platform: MusicPlatform, query: string): string {
  const q = encodeURIComponent(query.trim());
  switch (platform) {
    case "spotify":
      return `https://open.spotify.com/search/${q}`;
    case "youtube-music":
      return `https://music.youtube.com/search?q=${q}`;
    case "deezer":
      return `https://www.deezer.com/search/${q}`;
    case "apple-music":
      return `https://music.apple.com/fr/search?term=${q}`;
  }
}

/** Requête pour la bande originale d'une production (titre original + « soundtrack » + compositeur). */
export function soundtrackQuery(p: Pick<Production, "originalTitle" | "composers">): string {
  return `${p.originalTitle} soundtrack ${p.composers?.[0] ?? ""}`.trim();
}

export function hasMusic(p: Pick<Production, "composers" | "kind">) {
  return !!p.composers?.length && p.kind !== "comic";
}
