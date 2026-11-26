import data from "@/data/deezer.json";

interface DeezerData {
  fetchedAt?: string;
  albums: Record<string, { id: number; title: string; artist: string }>;
  tracks: Record<string, { id: number; title: string; artist: string; album: string }>;
}
const D = data as DeezerData;

export const deezerAlbum = (productionId: string) => D.albums[productionId];
export const deezerTrack = (productionId: string, title: string) => D.tracks[`${productionId}::${title}`];
