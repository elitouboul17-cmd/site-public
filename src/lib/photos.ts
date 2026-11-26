import photos from "@/data/person-photos.json";

export interface PersonPhoto {
  src: string;
  width: number;
  height: number;
  filePage: string;
  author: string;
  license: string;
  licenseUrl?: string;
  wikipedia: string;
  fetchedAt: string;
}

const PHOTOS = photos as Record<string, PersonPhoto>;

export function photoFor(personId: string): PersonPhoto | undefined {
  return PHOTOS[personId];
}

export function photoCount() {
  return Object.keys(PHOTOS).length;
}
