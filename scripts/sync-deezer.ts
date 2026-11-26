/**
 * Associe chaque bande originale et chaque chanson emblématique à son album / titre Deezer,
 * pour afficher le LECTEUR OFFICIEL Deezer dans l'appli (extrait de 30 s pour tous,
 * écoute complète pour les abonnés). API publique de Deezer, aucune clé requise.
 *
 * Garde-fous (on préfère aucun lecteur qu'un mauvais album) :
 *  - le titre de l'album doit contenir le titre original de l'œuvre ET une mention de bande originale ;
 *  - albums « unofficial », « inspired by », « tribute », « cover », « karaoke », « lullaby »… rejetés ;
 *  - l'artiste de l'album doit être l'un des compositeurs crédités (ou « Various Artists » pour les compilations) ;
 *  - pour une chanson : titre ET artiste doivent correspondre.
 *
 * Résultat : src/data/deezer.json (versionné). Usage : npm run sync:deezer
 */
import fs from "node:fs";
import { PRODUCTIONS } from "../src/lib/catalog";
import { FEATURED_TRACKS } from "../src/data/music";
import { normalize } from "../src/lib/text";

const OUT = "src/data/deezer.json";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clean = (s: string) => normalize(s).replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
const REJECT = /\b(unofficial|inspired|tribute|cover|covers|karaoke|lullaby|lullabies|piano|instrumental versions?|8 bit|8bit|remix(es)?|music box|epic version|orchestral tribute|ringtone|medley)\b/i;
const SOUNDTRACK = /\b(soundtrack|original score|score|music from|bande originale|ost|original motion picture|original series|original television)\b/i;

async function api(path: string): Promise<any> {
  for (let i = 0; i < 5; i++) {
    const res = await fetch(`https://api.deezer.com${path}`);
    const data = res.ok ? await res.json() : null;
    if (data && !data.error) { await sleep(150); return data; }
    await sleep(1500 * (i + 1));
  }
  return { data: [] };
}

/** Le titre de l'œuvre est présent, mais pas suivi d'un numéro de suite (« Deadpool 2 » ≠ « Deadpool »). */
function sameWork(albumTitle: string, workTitle: string) {
  const a = clean(albumTitle), w = clean(workTitle);
  const i = a.indexOf(w);
  if (i < 0) return false;
  const rest = a.slice(i + w.length);
  return !/^\s*(\d|ii\b|iii\b|iv\b|returns|reborn)/.test(rest);
}

/** Même chanson : titre identique, éventuellement suivi d'une mention entre parenthèses ou après un tiret. */
function sameSong(found: string, wanted: string) {
  const f = normalize(found).trim(), w = normalize(wanted).trim();
  if (!f.startsWith(w)) return false;
  return /^\s*($|\(|\[|-)/.test(f.slice(w.length));
}

function artistMatches(candidate: string, wanted: string[]) {
  const c = clean(candidate);
  return wanted.some((w) => {
    const x = clean(w);
    return c === x || c.includes(x) || x.includes(c);
  });
}

async function main() {
  const albums: Record<string, { id: number; title: string; artist: string }> = {};
  const tracks: Record<string, { id: number; title: string; artist: string; album: string }> = {};
  let ok = 0, miss = 0;

  for (const p of PRODUCTIONS) {
    if (!p.composers?.length || p.kind === "comic") continue;
      const data = await api(`/search/album?q=${encodeURIComponent(`${p.originalTitle} soundtrack`)}&limit=25`);
    const candidates = (data.data ?? []).filter((a: any) => {
      const t = a.title as string;
      return sameWork(t, p.originalTitle) && SOUNDTRACK.test(t) && !REJECT.test(t) && artistMatches(a.artist?.name ?? "", [...p.composers!, "Various Artists"]);
    });
    // Préférer l'album du compositeur, puis le plus complet.
    candidates.sort((a: any, b: any) => Number(artistMatches(b.artist.name, p.composers!)) - Number(artistMatches(a.artist.name, p.composers!)) || (b.nb_tracks ?? 0) - (a.nb_tracks ?? 0));
    const best = candidates[0];
    if (best) {
      albums[p.id] = { id: best.id, title: best.title, artist: best.artist.name };
      ok++;
    } else {
      miss++;
      console.log(`– ${p.id} : aucun album de BO officiel reconnu`);
    }
  }

  for (const [pid, list] of Object.entries(FEATURED_TRACKS)) {
    for (const t of list) {
      const mainArtist = t.artist.split(/\s+(?:&|and|feat\.?|x)\s+/i)[0];
      const data = await api(`/search/track?q=${encodeURIComponent(`artist:"${mainArtist}" track:"${t.title}"`)}&limit=10`);
      const hit = (data.data ?? []).find((x: any) => sameSong(x.title, t.title) && artistMatches(x.artist?.name ?? "", [mainArtist]) && !REJECT.test(x.title) && !REJECT.test(x.album?.title ?? ""));
      if (hit) tracks[`${pid}::${t.title}`] = { id: hit.id, title: hit.title, artist: hit.artist.name, album: hit.album.title };
      else console.log(`– ${pid} : titre « ${t.title} » introuvable`);
    }
  }

  fs.writeFileSync(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), albums, tracks }, null, 2) + "\n");
  console.log(`\nAlbums de BO associés : ${ok} — sans correspondance : ${miss} — chansons : ${Object.keys(tracks).length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
