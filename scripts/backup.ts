/**
 * Sauvegarde de la base de données.
 *  - SQLite : copie cohérente via « VACUUM INTO » dans data/backups/ (rotation : 14 dernières).
 *  - PostgreSQL : export JSON des tables (les sauvegardes Supabase automatiques restent recommandées).
 * Usage : npm run db:backup
 */
import fs from "node:fs";
import path from "node:path";
import { getSql } from "../src/lib/db/sql";

const DIR = path.resolve("data/backups");
const KEEP = 14;

async function main() {
  fs.mkdirSync(DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const sql = await getSql();
  if (sql.dialect === "sqlite") {
    const out = path.join(DIR, `marvelhq-${stamp}.db`);
    await sql.exec(`VACUUM INTO '${out.replace(/'/g, "''")}'`);
    console.log(`Sauvegarde SQLite : ${out}`);
  } else {
    const dump: Record<string, unknown[]> = {};
    for (const t of ["articles", "ingestion_runs", "source_health", "production_media"]) dump[t] = await sql.all(`SELECT * FROM ${t}`);
    const out = path.join(DIR, `marvelhq-${stamp}.json`);
    fs.writeFileSync(out, JSON.stringify(dump));
    console.log(`Export PostgreSQL : ${out}`);
  }
  const files = fs.readdirSync(DIR).filter((f) => f.startsWith("marvelhq-")).sort();
  for (const f of files.slice(0, Math.max(0, files.length - KEEP))) fs.unlinkSync(path.join(DIR, f));
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
