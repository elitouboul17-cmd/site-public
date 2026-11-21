/**
 * Vérifie le corpus éditorial contre les infobox de Wikipédia (EN) :
 *  - date(s) de sortie / de première diffusion ;
 *  - réalisation, musique ;
 *  - durée, nombre de saisons et d'épisodes ;
 *  - existence de l'article Wikipédia FR référencé (liens interlangues).
 *
 * Écrit src/data/verification.json, affiché sur chaque fiche (« Vérifié le … »).
 * Ne modifie JAMAIS les données : les écarts sont signalés pour correction humaine.
 *
 * Note : Wikidata a été envisagé en premier mais son API limite fortement les adresses IP
 * partagées (HTTP 429) ; l'API MediaWiki de Wikipédia est utilisée à la place, une page à la fois.
 *
 * Usage : npm run verify-data [-- --only=id1,id2]
 */
import fs from "node:fs";
import path from "node:path";
import { PRODUCTIONS } from "../src/lib/catalog";
import { normalize } from "../src/lib/text";
import { USER_AGENT } from "../src/data/sources";

const OUT = path.resolve("src/data/verification.json");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson(url: string): Promise<any> {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, "Api-User-Agent": USER_AGENT } });
    const type = res.headers.get("content-type") ?? "";
    if (res.ok && type.includes("json")) return res.json();
    const wait = Number(res.headers.get("retry-after")) || 4 * attempt;
    if (attempt === 5) throw new Error(`HTTP ${res.status} (${type}) pour ${url.slice(0, 100)}…`);
    console.log(`  … ${res.status}, nouvel essai dans ${wait}s`);
    await sleep(wait * 1000);
  }
}

/** Extrait le texte d'un paramètre d'infobox, en gérant les accolades imbriquées. */
function infoboxParam(wikitext: string, names: string[]): string | undefined {
  for (const name of names) {
    const re = new RegExp(`\\n\\|\\s*${name}\\s*=`, "i");
    const m = re.exec(wikitext);
    if (!m) continue;
    let i = m.index + m[0].length;
    let depth = 0;
    let out = "";
    while (i < wikitext.length) {
      const two = wikitext.slice(i, i + 2);
      if (two === "{{" || two === "[[") { depth++; out += two; i += 2; continue; }
      if (two === "}}" || two === "]]") {
        if (depth === 0) break;
        depth--; out += two; i += 2; continue;
      }
      if (depth === 0 && wikitext[i] === "\n" && wikitext[i + 1] === "|") break;
      out += wikitext[i++];
    }
    const v = out.replace(/<!--[\s\S]*?-->/g, "").replace(/<ref[\s\S]*?(\/>|<\/ref>)/g, "").trim();
    if (v) return v;
  }
}

function linkNames(v?: string): string[] {
  if (!v) return [];
  const names = [...v.matchAll(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g)].map((m) => (m[2] ?? m[1]).trim());
  if (names.length) return names;
  return v.replace(/\{\{[^}]*\}\}/g, "").split(/[\n,*]|<br\s*\/?>/).map((s) => s.trim()).filter(Boolean);
}

function datesIn(v?: string): string[] {
  if (!v) return [];
  const out: string[] = [];
  // {{Film date|2010|04|26|lieu|2010|05|07|United States}} et {{Start date|2021|1|15}}
  for (const m of v.matchAll(/\{\{\s*(?:film date|start date|release date|start date and age|end date|video game release)[^}]*\}\}/gi)) {
    const parts = m[0].slice(2, -2).split("|").slice(1).map((s) => s.trim());
    for (let i = 0; i < parts.length; i++) {
      if (/^\d{4}$/.test(parts[i])) {
        const y = parts[i], mo = parts[i + 1], d = parts[i + 2];
        if (mo && /^\d{1,2}$/.test(mo) && d && /^\d{1,2}$/.test(d)) { out.push(`${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`); i += 2; }
        else if (mo && /^\d{1,2}$/.test(mo)) { out.push(`${y}-${mo.padStart(2, "0")}`); i += 1; }
        else out.push(y);
      }
    }
  }
  // Dates en clair : « May 2, 2008 » / « 2 May 2008 »
  const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  for (const m of v.matchAll(/\b([A-Z][a-z]+) (\d{1,2}), (\d{4})\b/g)) {
    const mi = MONTHS.indexOf(m[1].toLowerCase());
    if (mi >= 0) out.push(`${m[3]}-${String(mi + 1).padStart(2, "0")}-${m[2].padStart(2, "0")}`);
  }
  return [...new Set(out)];
}

function firstNumber(v?: string) {
  const m = v?.replace(/<[^>]+>/g, "").match(/\d+/);
  return m ? Number(m[0]) : undefined;
}

type Check = { field: string; ours?: string; reference?: string; ok: boolean };

async function main() {
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
  const targets = PRODUCTIONS.filter((p) => p.wikipedia?.en && (!only || only.includes(p.id)));
  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { productions: {} };
  const results: Record<string, unknown> = { ...(prev.productions ?? {}) };
  const now = new Date().toISOString();
  let ok = 0, gaps = 0, missing = 0, done = 0;
  const save = () =>
    fs.writeFileSync(OUT, JSON.stringify({ generatedAt: now, method: "Infobox Wikipédia (EN) via l'API MediaWiki + liens interlangues FR", productions: results }, null, 2) + "\n");

  for (const p of targets) {
    const title = p.wikipedia!.en!;
    const url = `https://en.wikipedia.org/w/api.php?${new URLSearchParams({
      action: "query", format: "json", formatversion: "2", redirects: "1", prop: "revisions|langlinks",
      rvprop: "content", rvslots: "main", rvsection: "0", lllang: "fr", titles: title.replace(/_/g, " "),
    })}`;
    let page: any;
    try {
      page = (await getJson(url)).query?.pages?.[0];
    } catch (e) {
      console.log(`✗ ${p.id}: ${(e as Error).message}`);
      continue;
    }
    await sleep(250);
    if (!page || page.missing) {
      results[p.id] = { checkedAt: now, status: "introuvable", checks: [], referenceUrl: `https://en.wikipedia.org/wiki/${title}` };
      missing++;
      console.log(`✗ ${p.id}: article EN introuvable (${title})`);
      continue;
    }
    const wt: string = "\n" + (page.revisions?.[0]?.slots?.main?.content ?? "");
    const checks: Check[] = [];

    const released = infoboxParam(wt, ["released", "release_date", "first_aired", "released_date", "date", "publisher_date", "pub_date"]);
    const dates = datesIn(released);
    if (p.releaseDate || dates.length) {
      const okDate = !!p.releaseDate && dates.some((d) => d === p.releaseDate || (p.releaseDate!.length < 10 && d.startsWith(p.releaseDate!)));
      checks.push({ field: "date de sortie", ours: p.releaseDate, reference: dates.join(", ") || released?.slice(0, 80), ok: okDate });
    }
    const dir = linkNames(infoboxParam(wt, ["director", "directed_by", "director(s)"]));
    if (p.directors?.length && dir.length && !["serie", "serie-animee"].includes(p.kind)) {
      const ref = dir.map(normalize);
      checks.push({ field: "réalisation", ours: p.directors.join(", "), reference: dir.join(", "), ok: p.directors.every((d) => ref.some((r) => r.includes(normalize(d)) || normalize(d).includes(r))) });
    }
    const music = linkNames(infoboxParam(wt, ["music", "composer"]));
    if (p.composers?.length && music.length) {
      const ref = music.map(normalize);
      checks.push({ field: "musique", ours: p.composers.join(", "), reference: music.join(", "), ok: p.composers.some((d) => ref.some((r) => r.includes(normalize(d)) || normalize(d).includes(r))) });
    }
    const runtime = firstNumber(infoboxParam(wt, ["runtime"]));
    if (p.runtime && runtime && ["film", "film-anime", "presentation-speciale"].includes(p.kind))
      checks.push({ field: "durée (min)", ours: String(p.runtime), reference: String(runtime), ok: Math.abs(runtime - p.runtime) <= 3 });
    const seasons = firstNumber(infoboxParam(wt, ["num_seasons", "num_series"]));
    if (p.seasons && seasons) checks.push({ field: "saisons", ours: String(p.seasons), reference: String(seasons), ok: seasons === p.seasons });
    const episodes = firstNumber(infoboxParam(wt, ["num_episodes"]));
    if (p.episodes && episodes) checks.push({ field: "épisodes", ours: String(p.episodes), reference: String(episodes), ok: episodes === p.episodes });
    const fr: string | undefined = page.langlinks?.[0]?.title;
    if (p.wikipedia?.fr)
      checks.push({ field: "article Wikipédia FR", ours: p.wikipedia.fr.replace(/_/g, " "), reference: fr, ok: !!fr && normalize(fr) === normalize(p.wikipedia.fr.replace(/_/g, " ")) });

    const failed = checks.filter((c) => !c.ok);
    const status = checks.length === 0 ? "partiel" : failed.length ? "ecart" : "ok";
    if (status === "ok") ok++; else gaps++;
    results[p.id] = { checkedAt: now, status, checks, referenceUrl: `https://en.wikipedia.org/wiki/${encodeURI(page.title.replace(/ /g, "_"))}` };
    if (++done % 10 === 0) save();
    if (failed.length) console.log(`△ ${p.id}: ${failed.map((f) => `${f.field} [nous: ${f.ours ?? "—"} | réf: ${f.reference ?? "—"}]`).join(" ; ")}`);
  }

  save();
  console.log(`\nVérifiées : ${targets.length} — conformes : ${ok} — écarts : ${gaps} — introuvables : ${missing}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
