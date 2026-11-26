/**
 * Photos des personnes (acteurs, réalisateurs, compositeurs…) depuis Wikimedia Commons,
 * via l'API de Wikipédia. Aucune clé requise.
 *
 * Garde-fous :
 *  - la page Wikipédia doit correspondre à la bonne personne (pas une page d'homonymie,
 *    description contenant un métier du cinéma ou de la musique), sinon essai de
 *    « Nom (actor) », « Nom (filmmaker) »… et à défaut : aucune photo ;
 *  - seules les images sous licence libre (CC BY, CC BY-SA, CC0, domaine public) sont gardées ;
 *  - l'auteur et la licence sont enregistrés et affichés sous chaque photo.
 *
 * Résultat : src/data/person-photos.json (versionné, relu comme le reste du corpus).
 * Usage : npm run sync:photos [-- --only=robert-downey-jr,alan-silvestri]
 */
import fs from "node:fs";
import path from "node:path";
import { PEOPLE } from "../src/lib/catalog";
import { USER_AGENT } from "../src/data/sources";

const OUT = path.resolve("src/data/person-photos.json");

/** Homonymes identifiés lors de la relecture : la page Wikipédia trouvée n'est pas la bonne personne. */
const EXCLUDE = new Set([
  "jeff-kaplan", // page = concepteur de jeux vidéo, pas le scénariste de The Fantastic Four: First Steps
]);
const API = "https://en.wikipedia.org/w/api.php";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const JOBS = /\b(actor|actress|director|filmmaker|screenwriter|writer|producer|composer|musician|singer|rapper|songwriter|editor|cinematographer|designer|comedian|television|film|voice|stunt|animator|artist|personality|entertainer|model|wrestler|athlete|dancer)\b/i;

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

async function api(params: Record<string, string>): Promise<any> {
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  for (let attempt = 1; attempt <= 6; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, "Api-User-Agent": USER_AGENT } });
    if (res.ok && (res.headers.get("content-type") ?? "").includes("json")) {
      await sleep(800);
      return res.json();
    }
    const wait = Number(res.headers.get("retry-after")) || 5 * attempt;
    console.log(`  … Wikipédia ${res.status}, nouvel essai dans ${wait}s`);
    await sleep(wait * 1000);
  }
  throw new Error("Wikipédia indisponible");
}

const stripHtml = (s?: string) => (s ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const chunk = <T,>(a: T[], n: number) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

/** Interroge un lot de titres : page, description, homonymie, image principale. */
async function lookup(titles: string[]) {
  const data = await api({ action: "query", redirects: "1", prop: "pageimages|description|pageprops", piprop: "name", ppprop: "disambiguation", titles: titles.join("|") });
  const norm = new Map<string, string>();
  for (const n of data.query?.normalized ?? []) norm.set(n.from, n.to);
  for (const r of data.query?.redirects ?? []) norm.set(r.from, r.to);
  const pages = new Map<string, any>((data.query?.pages ?? []).map((p: any) => [p.title, p]));
  return (t: string) => {
    let k = t;
    for (let i = 0; i < 3 && norm.has(k); i++) k = norm.get(k)!;
    return pages.get(k);
  };
}

function acceptable(page: any) {
  return page && !page.missing && !page.pageprops?.disambiguation && JOBS.test(page.description ?? "") && page.pageimage;
}

async function main() {
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
  const prev: Record<string, PersonPhoto> = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
  const people = [...PEOPLE.values()].filter((p) => (!only || only.includes(p.id)) && !EXCLUDE.has(p.id));
  const found = new Map<string, { page: any; title: string }>();

  // 1. Titre = nom ; puis variantes désambiguïsées pour ceux qui ne correspondent pas.
  const variants = (name: string) => [name, `${name} (actor)`, `${name} (actress)`, `${name} (filmmaker)`, `${name} (director)`, `${name} (composer)`, `${name} (musician)`];
  for (let round = 0; round < variants("x").length; round++) {
    const pending = people.filter((p) => !found.has(p.id));
    if (!pending.length) break;
    for (const group of chunk(pending, 40)) {
      const titles = group.map((p) => variants(p.name)[round]);
      const get = await lookup(titles);
      group.forEach((p, i) => {
        const page = get(titles[i]);
        if (acceptable(page)) found.set(p.id, { page, title: page.title });
      });
    }
    console.log(`Passe ${round + 1} : ${found.size}/${people.length} personnes identifiées avec une image`);
  }

  // 2. Licence, auteur et vignette de chaque image.
  const files = [...new Set([...found.values()].map((f) => `File:${f.page.pageimage}`))];
  const info = new Map<string, any>();
  for (const group of chunk(files, 40)) {
    const data = await api({ action: "query", prop: "imageinfo", iiprop: "url|extmetadata|size", iiurlwidth: "400", titles: group.join("|") });
    const norm = new Map<string, string>((data.query?.normalized ?? []).map((n: any) => [n.from, n.to]));
    for (const p of data.query?.pages ?? []) info.set(p.title, p);
    for (const [from, to] of norm) info.set(from, info.get(to));
  }

  const out: Record<string, PersonPhoto> = { ...prev };
  for (const id of EXCLUDE) delete out[id];
  let kept = 0, rejected = 0;
  const now = new Date().toISOString();
  for (const p of people) {
    const f = found.get(p.id);
    if (!f) continue;
    const ii = info.get(`File:${f.page.pageimage}`)?.imageinfo?.[0];
    const meta = ii?.extmetadata ?? {};
    const license = stripHtml(meta.LicenseShortName?.value);
    const free = /^(cc[ -]?by|cc0|public domain|pd)/i.test(license) && !/\b(nc|nd)\b/i.test(license);
    if (!ii?.thumburl || !free) { rejected++; console.log(`– ${p.name} : image non libre ou introuvable (${license || "licence inconnue"})`); delete out[p.id]; continue; }
    out[p.id] = {
      src: ii.thumburl,
      width: ii.thumbwidth,
      height: ii.thumbheight,
      filePage: ii.descriptionurl,
      author: stripHtml(meta.Artist?.value).slice(0, 120) || "Auteur inconnu",
      license,
      licenseUrl: meta.LicenseUrl?.value,
      wikipedia: `https://en.wikipedia.org/wiki/${encodeURIComponent(f.title.replace(/ /g, "_"))}`,
      fetchedAt: now,
    };
    kept++;
  }
  fs.writeFileSync(OUT, JSON.stringify(Object.fromEntries(Object.entries(out).sort()), null, 2) + "\n");
  console.log(`\nPhotos libres enregistrées : ${kept} — rejetées (licence) : ${rejected} — sans page correspondante : ${people.length - found.size}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
