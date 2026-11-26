/**
 * Synchronise les affiches depuis The Movie Database (TMDB) — OPTIONNEL.
 * Gratuit pour un usage non commercial, attribution obligatoire (affichée sur les fiches).
 * Requiert TMDB_READ_TOKEN (« API Read Access Token », https://www.themoviedb.org/settings/api).
 *
 * Pour chaque film/série : recherche par titre original + année, ne retient le résultat que si
 * l'année de sortie concorde (sinon : aucune affiche plutôt qu'une mauvaise affiche).
 * La date TMDB est enregistrée à titre de contrôle croisé, jamais substituée à la fiche.
 *
 * Usage : npm run sync:tmdb
 */
import { PRODUCTIONS } from "../src/lib/catalog";
import fs from "node:fs";
import { saveProductionMedia, type ProductionMedia } from "../src/lib/db/repo";

const TOKEN = process.env.TMDB_READ_TOKEN;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function tmdb(path: string, params: Record<string, string>) {
  const res = await fetch(`https://api.themoviedb.org/3${path}?${new URLSearchParams(params)}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" },
  });
  if (res.status === 429) { await sleep(2000); return tmdb(path, params); }
  if (!res.ok) throw new Error(`TMDB ${res.status} sur ${path}`);
  return res.json();
}

async function main() {
  if (!TOKEN) {
    console.error("TMDB_READ_TOKEN manquant : synchronisation ignorée. Les visuels typographiques restent utilisés.");
    process.exit(0);
  }
  let found = 0, skipped = 0;
  // Les chemins d'images sont aussi versionnés (src/data/tmdb-media.json) : l'appli déployée
  // les affiche sans avoir à relancer la synchronisation sur la base de production.
  const snapshot: Record<string, ProductionMedia> = {};
  for (const p of PRODUCTIONS) {
    const isTv = p.kind === "serie" || p.kind === "serie-animee";
    if (!["film", "film-anime", "presentation-speciale", "serie", "serie-animee"].includes(p.kind) || !p.releaseDate) { skipped++; continue; }
    const year = p.releaseDate.slice(0, 4);
    const data = await tmdb(isTv ? "/search/tv" : "/search/movie", { query: p.originalTitle, language: "fr-FR", ...(isTv ? { first_air_date_year: year } : { year }) });
    const hit = (data.results as any[]).find((r) => (r.release_date ?? r.first_air_date ?? "").startsWith(year));
    if (!hit) { console.log(`– ${p.id} : aucun résultat TMDB concordant (${year})`); skipped++; continue; }
    const media: ProductionMedia = {
      productionId: p.id, provider: "tmdb", providerId: String(hit.id), posterPath: hit.poster_path ?? undefined,
      backdropPath: hit.backdrop_path ?? undefined, providerReleaseDate: hit.release_date ?? hit.first_air_date, fetchedAt: new Date().toISOString(),
    };
    snapshot[p.id] = media;
    try { await saveProductionMedia(media); } catch { /* base indisponible : l'instantané JSON suffit */ }
    const tmdbDate = hit.release_date ?? hit.first_air_date;
    // TMDB retient la première sortie mondiale ; nos fiches donnent la sortie américaine (vérifiée contre Wikipédia).
    if (tmdbDate && tmdbDate !== p.releaseDate) console.log(`· ${p.id} : première sortie mondiale TMDB ${tmdbDate}, sortie US ${p.releaseDate}`);
    found++;
    await sleep(120);
  }
  fs.writeFileSync("src/data/tmdb-media.json", JSON.stringify(Object.fromEntries(Object.entries(snapshot).sort()), null, 2) + "\n");
  console.log(`\nAffiches synchronisées : ${found} — ignorées : ${skipped}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
