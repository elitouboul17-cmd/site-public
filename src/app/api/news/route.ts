import { NextResponse } from "next/server";
import { z } from "zod";
import { safeArticles } from "@/lib/news";

export const dynamic = "force-dynamic";

const Query = z.object({
  categorie: z.enum(["marvel-studios", "mcu", "films", "series", "casting", "realisation", "production", "comics", "animation", "jeux-video", "disney-marvel", "bandes-annonces"]).optional(),
  fiabilite: z.enum(["officiel", "reporte", "rumeur", "theorie"]).optional(),
  production: z.string().max(80).regex(/^[a-z0-9-]+$/).optional(),
  personnage: z.string().max(80).regex(/^[a-z0-9-]+$/).optional(),
  q: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
});

/** API publique en lecture seule des actualités (JSON). */
export async function GET(req: Request) {
  const parsed = Query.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Paramètres invalides", details: parsed.error.issues }, { status: 400 });
  const p = parsed.data;
  const res = await safeArticles({ category: p.categorie, reliability: p.fiabilite, productionId: p.production, characterId: p.personnage, q: p.q, limit: p.limit, offset: p.offset });
  return NextResponse.json(res, { status: res.error ? 503 : 200 });
}
