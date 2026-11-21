import { NextResponse } from "next/server";
import { newsStatus } from "@/lib/news";

export const dynamic = "force-dynamic";

/** État de santé : base de données et sources (sans information sensible). */
export async function GET() {
  const s = await newsStatus();
  const failing = s.health.filter((h) => h.consecutiveFailures > 0).map((h) => ({ source: h.sourceId, failures: h.consecutiveFailures, error: h.lastError }));
  return NextResponse.json(
    { database: s.error ? "indisponible" : "ok", lastRun: s.runs[0] ? { status: s.runs[0].status, startedAt: s.runs[0].startedAt, stats: s.runs[0].stats } : null, failingSources: failing },
    { status: s.error ? 503 : 200 },
  );
}
