/**
 * Détails TMDB des productions déjà associées (src/data/tmdb-media.json) :
 *  - budget et recettes mondiales (films) — chiffres déclarés/estimés, affichés comme tels ;
 *  - vidéos YouTube OFFICIELLES : bandes-annonces, teasers, featurettes / coulisses (FR puis EN) ;
 *  - où regarder en France (données fournies par JustWatch via TMDB, attribution affichée).
 *
 * Résultat : src/data/tmdb-details.json (versionné). Usage : npm run sync:tmdb-details
 * Requiert TMDB_READ_TOKEN (gratuit, usage non commercial).
 */
import fs from "node:fs";
import { productionById } from "../src/lib/catalog";
import media from "../src/data/tmdb-media.json";

const TOKEN = process.env.TMDB_READ_TOKEN;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface TmdbVideo { key: string; name: string; type: "Trailer" | "Teaser" | "Featurette" | "Behind the Scenes" | "Clip"; lang: string; published?: string }
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

const KEEP = new Set(["Trailer", "Teaser", "Featurette", "Behind the Scenes", "Clip"]);
const ORDER = ["Trailer", "Teaser", "Behind the Scenes", "Featurette", "Clip"];

async function tmdb(path: string): Promise<any> {
  for (let i = 0; i < 4; i++) {
    const res = await fetch(`https://api.themoviedb.org/3${path}`, { headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" } });
    if (res.status === 429) { await sleep(2000 * (i + 1)); continue; }
    if (!res.ok) throw new Error(`TMDB ${res.status} sur ${path}`);
    return res.json();
  }
  throw new Error("TMDB indisponible");
}

const providers = (list?: any[]): Provider[] => (list ?? []).sort((a, b) => a.display_priority - b.display_priority).map((p) => ({ name: p.provider_name, logo: p.logo_path ?? undefined }));

async function main() {
  if (!TOKEN) { console.error("TMDB_READ_TOKEN manquant."); process.exit(0); }
  const out: Record<string, TmdbDetails> = {};
  for (const [pid, m] of Object.entries(media as Record<string, { providerId?: string }>)) {
    const p = productionById.get(pid);
    if (!p || !m.providerId) continue;
    const type = p.kind === "serie" || p.kind === "serie-animee" ? "tv" : "movie";
    const j = await tmdb(`/${type}/${m.providerId}?append_to_response=videos,watch/providers&include_video_language=fr,en,null`);
    const videos: TmdbVideo[] = (j.videos?.results ?? [])
      .filter((v: any) => v.site === "YouTube" && v.official && KEEP.has(v.type) && /^[\w-]{6,20}$/.test(v.key))
      .sort((a: any, b: any) =>
        ORDER.indexOf(a.type) - ORDER.indexOf(b.type) ||
        Number(b.iso_639_1 === "fr") - Number(a.iso_639_1 === "fr") ||
        (b.published_at ?? "").localeCompare(a.published_at ?? ""))
      .slice(0, 12)
      .map((v: any) => ({ key: v.key, name: v.name, type: v.type, lang: v.iso_639_1, published: v.published_at?.slice(0, 10) }));
    const fr = j["watch/providers"]?.results?.FR;
    out[pid] = {
      tmdbType: type,
      tmdbId: String(m.providerId),
      budget: type === "movie" && j.budget > 0 ? j.budget : undefined,
      revenue: type === "movie" && j.revenue > 0 ? j.revenue : undefined,
      videos,
      watch: fr ? { link: fr.link, flatrate: providers(fr.flatrate), rent: providers(fr.rent), buy: providers(fr.buy), free: providers([...(fr.free ?? []), ...(fr.ads ?? [])]) } : undefined,
      fetchedAt: new Date().toISOString(),
    };
    await sleep(120);
  }
  fs.writeFileSync("src/data/tmdb-details.json", JSON.stringify(Object.fromEntries(Object.entries(out).sort()), null, 2) + "\n");
  const n = Object.values(out);
  console.log(`Productions : ${n.length} — avec bandes-annonces/vidéos : ${n.filter((d) => d.videos.length).length} (${n.reduce((s, d) => s + d.videos.length, 0)} vidéos) — avec box-office : ${n.filter((d) => d.revenue).length} — où regarder (FR) : ${n.filter((d) => d.watch).length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
