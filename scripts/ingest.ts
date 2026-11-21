/**
 * Ingestion en ligne de commande.
 *   npm run ingest                 → une exécution (respecte les intervalles des sources)
 *   npm run ingest -- --force      → ignore les intervalles
 *   npm run ingest -- --watch      → boucle (INGEST_INTERVAL_MINUTES, 60 par défaut)
 *   npm run ingest -- --source=d23,deadline-marvel
 */
import { runIngestion } from "../src/lib/ingest/run";

const args = process.argv.slice(2);
const force = args.includes("--force");
const watch = args.includes("--watch");
const sourceIds = args.find((a) => a.startsWith("--source="))?.slice(9).split(",");
const interval = Math.max(5, Number(process.env.INGEST_INTERVAL_MINUTES || 60));

async function once() {
  const run = await runIngestion({ trigger: "cli", force, sourceIds });
  console.log(`\n→ ${run.status.toUpperCase()} — récupérés ${run.stats.fetched}, nouveaux ${run.stats.created}, mis à jour ${run.stats.updated}, connus ${run.stats.duplicates}, ignorés ${run.stats.skipped}, erreurs ${run.stats.errors}`);
  return run;
}

(async () => {
  const run = await once();
  if (!watch) process.exit(run.status === "echec" ? 1 : 0);
  console.log(`Mode surveillance : prochaine exécution dans ${interval} min.`);
  setInterval(() => once().catch((e) => console.error(e)), interval * 60_000);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
