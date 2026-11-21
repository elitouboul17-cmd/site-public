import { NextResponse } from "next/server";
import { searchCatalog, scoreText, type SearchHit } from "@/lib/search";
import { safeArticles } from "@/lib/news";
import { normalize } from "@/lib/text";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").slice(0, 100).trim();
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 40, 1), 100);
  if (q.length < 2) return NextResponse.json({ q, hits: [] });
  const hits: SearchHit[] = searchCatalog(q, limit);
  const { items } = await safeArticles({ q, limit: 10 });
  const nq = normalize(q);
  for (const a of items) {
    hits.push({
      kind: "article", id: a.id, title: a.title, href: `/actualites/${a.id}`,
      subtitle: `${a.sourceName} · ${a.publishedAt.slice(0, 10)}`,
      score: Math.max(scoreText(nq, [normalize(a.title)], normalize(a.summary)), 15) - 5,
    });
  }
  hits.sort((a, b) => b.score - a.score);
  return NextResponse.json({ q, hits: hits.slice(0, limit) }, { headers: { "Cache-Control": "private, max-age=30" } });
}
