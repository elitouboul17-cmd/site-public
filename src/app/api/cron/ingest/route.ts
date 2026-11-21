import { NextResponse } from "next/server";
import { checkBearer } from "@/lib/auth";
import { runIngestion } from "@/lib/ingest/run";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Déclenchement planifié de l'ingestion (Vercel Cron, GitHub Actions, cron système…).
 * Protégé par `Authorization: Bearer $CRON_SECRET`. Vercel Cron envoie ce jeton automatiquement.
 */
async function handle(req: Request) {
  if (!checkBearer(req.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  try {
    const run = await runIngestion({ trigger: req.headers.get("x-trigger") === "manuel" ? "manuel" : "cron", force });
    return NextResponse.json({ id: run.id, status: run.status, stats: run.stats, errors: run.log.filter((l) => l.level === "error") });
  } catch (e) {
    console.error("[cron] échec de l'ingestion", e);
    return NextResponse.json({ error: "Échec de l'ingestion", message: (e as Error).message }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
