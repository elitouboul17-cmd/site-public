import deezer from "@/data/deezer.json";
import apple from "@/data/apple-music.json";

/** Sources de lecture intégrée disponibles pour une bande originale ou une chanson. */
export type PlayerSource =
  | { platform: "deezer"; kind: "album" | "track"; id: number }
  | { platform: "apple"; kind: "album" | "track"; id: number; albumId?: number };

type Albums = Record<string, { id: number }>;
type DeezerTracks = Record<string, { id: number }>;
type AppleTracks = Record<string, { id: number; albumId: number }>;

const DZ = deezer as { albums: Albums; tracks: DeezerTracks };
const AP = apple as { albums: Albums; tracks: AppleTracks };

export function albumSources(productionId: string): PlayerSource[] {
  const out: PlayerSource[] = [];
  if (DZ.albums[productionId]) out.push({ platform: "deezer", kind: "album", id: DZ.albums[productionId].id });
  if (AP.albums[productionId]) out.push({ platform: "apple", kind: "album", id: AP.albums[productionId].id });
  return out;
}

export function trackSources(productionId: string, title: string): PlayerSource[] {
  const key = `${productionId}::${title}`;
  const out: PlayerSource[] = [];
  if (DZ.tracks[key]) out.push({ platform: "deezer", kind: "track", id: DZ.tracks[key].id });
  if (AP.tracks[key]) out.push({ platform: "apple", kind: "track", id: AP.tracks[key].id, albumId: AP.tracks[key].albumId });
  return out;
}

export function albumTitle(productionId: string): string | undefined {
  return (deezer as { albums: Record<string, { title: string }> }).albums[productionId]?.title ??
    (apple as { albums: Record<string, { title: string }> }).albums[productionId]?.title;
}
