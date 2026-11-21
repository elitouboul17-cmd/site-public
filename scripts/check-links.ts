/**
 * Vérifie les liens externes du corpus (sources des fiches, coulisses, quiz, chronologie).
 * Requêtes HEAD (repli GET), espacées, avec User-Agent identifiable.
 * Usage : npm run check-links
 */
import { PRODUCTIONS, BEHIND_THE_SCENES, QUIZ, TIMELINE, UNIVERSES } from "../src/lib/catalog";
import { EVENTS } from "../src/data/events";
import { USER_AGENT } from "../src/data/sources";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function check(url: string): Promise<number> {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      let res = await fetch(url, { method: "HEAD", redirect: "follow", headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(15000) });
      if (res.status === 405) res = await fetch(url, { redirect: "follow", headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(15000) });
      if (res.status === 429) { await sleep((Number(res.headers.get("retry-after")) || 10) * 1000); continue; }
      return res.status;
    } catch {
      if (attempt === 4) return 0;
    }
  }
  return 429;
}

async function main() {
  const urls = new Map<string, string>();
  const add = (u: string | undefined, where: string) => { if (u && !urls.has(u)) urls.set(u, where); };
  for (const p of PRODUCTIONS) p.sources?.forEach((s) => add(s.url, `production ${p.id}`));
  for (const b of BEHIND_THE_SCENES) b.sources?.forEach((s) => add(s.url, `coulisses ${b.id}`));
  for (const q of QUIZ) add(q.source.url, `quiz ${q.id}`);
  for (const t of TIMELINE) t.sources?.forEach((s) => add(s.url, `chronologie ${t.id}`));
  for (const u of UNIVERSES) u.sources?.forEach((s) => add(s.url, `univers ${u.id}`));
  for (const e of EVENTS) e.sources?.forEach((s) => add(s.url, `événement ${e.id}`));

  const broken: string[] = [];
  let n = 0;
  for (const [url, where] of urls) {
    const status = await check(url);
    if (status < 200 || status >= 400) { broken.push(`${status || "ERR"} ${url} (${where})`); console.log(`✗ ${status || "ERR"} ${url}`); }
    if (++n % 25 === 0) console.log(`… ${n}/${urls.size}`);
    await sleep(300);
  }
  console.log(`\n${urls.size} liens vérifiés, ${broken.length} en erreur.`);
  if (broken.length) { console.log(broken.join("\n")); process.exit(1); }
}

main().catch((e) => { console.error(e); process.exit(1); });
