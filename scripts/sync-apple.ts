/**
 * Associe bandes originales et chansons à leurs albums / titres Apple Music, pour le LECTEUR
 * OFFICIEL Apple Music intégré (extrait pour tous, écoute complète pour les abonnés connectés).
 * API publique de recherche d'Apple (iTunes Search), aucune clé requise.
 * Mêmes garde-fous que pour Deezer (scripts/lib/music-match.ts).
 *
 * Résultat : src/data/apple-music.json (versionné). Usage : npm run sync:apple
 */
import fs from "node:fs";
import { PRODUCTIONS } from "../src/lib/catalog";
import { FEATURED_TRACKS } from "../src/data/music";
import { REJECT, SOUNDTRACK, sameWork, sameSong, artistMatches } from "./lib/music-match";

const OUT = "src/data/apple-music.json";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function search(params: Record<string, string>): Promise<any[]> {
  const url = `https://itunes.apple.com/search?${new URLSearchParams({ country: "fr", limit: "25", ...params })}`;
  for (let i = 0; i < 5; i++) {
    const res = await fetch(url);
    if (res.ok) {
      await sleep(3200); // l'API Apple tolère ~20 requêtes par minute
      return (await res.json()).results ?? [];
    }
    await sleep(15000 * (i + 1));
  }
  return [];
}

async function main() {
  const albums: Record<string, { id: number; title: string; artist: string }> = {};
  const tracks: Record<string, { id: number; albumId: number; title: string; artist: string; album: string }> = {};
  let miss = 0;

  for (const p of PRODUCTIONS) {
    if (!p.composers?.length || p.kind === "comic") continue;
    const results = await search({ term: `${p.originalTitle} soundtrack`, entity: "album" });
    const candidates = results.filter((a) => {
      const t: string = a.collectionName ?? "";
      return sameWork(t, p.originalTitle) && SOUNDTRACK.test(t) && !REJECT.test(t) && !REJECT.test(a.artistName ?? "") && artistMatches(a.artistName ?? "", [...p.composers!, "Various Artists"]);
    });
    candidates.sort((a, b) => Number(artistMatches(b.artistName, p.composers!)) - Number(artistMatches(a.artistName, p.composers!)) || (b.trackCount ?? 0) - (a.trackCount ?? 0));
    const best = candidates[0];
    if (best) albums[p.id] = { id: best.collectionId, title: best.collectionName, artist: best.artistName };
    else { miss++; console.log(`– ${p.id} : aucun album de BO officiel reconnu`); }
  }

  for (const [pid, list] of Object.entries(FEATURED_TRACKS)) {
    for (const t of list) {
      const mainArtist = t.artist.split(/\s+(?:&|and|feat\.?|x)\s+/i)[0];
      const results = await search({ term: `${t.title} ${mainArtist}`, entity: "song" });
      const hit = results.find((x) => sameSong(x.trackName ?? "", t.title) && artistMatches(x.artistName ?? "", [mainArtist]) && !REJECT.test(x.trackName ?? "") && !REJECT.test(x.collectionName ?? ""));
      if (hit) tracks[`${pid}::${t.title}`] = { id: hit.trackId, albumId: hit.collectionId, title: hit.trackName, artist: hit.artistName, album: hit.collectionName };
      else console.log(`– ${pid} : titre « ${t.title} » introuvable`);
    }
  }

  fs.writeFileSync(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), albums, tracks }, null, 2) + "\n");
  console.log(`\nAlbums de BO associés : ${Object.keys(albums).length} — sans correspondance : ${miss} — chansons : ${Object.keys(tracks).length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
