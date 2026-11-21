import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { groupedArticles } from "@/lib/news";
import { NEWS_CATEGORY_LABELS, RELIABILITY } from "@/lib/labels";
import { productionById, characterById, PRODUCTIONS } from "@/lib/catalog";
import { NEWS_SOURCES } from "@/data/sources";
import type { NewsCategory, Reliability } from "@/lib/types";
import { ArticleCard } from "@/components/ArticleCard";
import { EmptyState, FilterLink, PageHeader, ReliabilityBadge } from "@/components/ui";
import { PersistFilters } from "@/components/PersistFilters";

export const metadata: Metadata = { title: "Actualités" };
export const dynamic = "force-dynamic";

const PER_PAGE = 20;
const PERIODS: Record<string, { label: string; days?: number }> = {
  tout: { label: "Toutes dates" },
  "24h": { label: "24 heures", days: 1 },
  "7j": { label: "7 jours", days: 7 },
  "30j": { label: "30 jours", days: 30 },
};

export default async function NewsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const category = sp.categorie && sp.categorie in NEWS_CATEGORY_LABELS ? (sp.categorie as NewsCategory) : undefined;
  const reliability = sp.fiabilite && sp.fiabilite in RELIABILITY ? (sp.fiabilite as Reliability) : undefined;
  const productionId = sp.production && productionById.has(sp.production) ? sp.production : undefined;
  const characterId = sp.personnage && characterById.has(sp.personnage) ? sp.personnage : undefined;
  const sourceId = NEWS_SOURCES.some((s) => s.id === sp.source) ? sp.source : undefined;
  const period = sp.periode && sp.periode in PERIODS ? sp.periode : "tout";
  const q = sp.q?.slice(0, 100) || undefined;
  const page = Math.max(1, Math.min(200, Number(sp.page) || 1));
  const days = PERIODS[period].days;

  const res = await groupedArticles({
    category, reliability, productionId, characterId, sourceId, q,
    from: days ? new Date(Date.now() - days * 86400_000).toISOString() : undefined,
    limit: PER_PAGE, offset: (page - 1) * PER_PAGE,
  });

  const current = { categorie: category, fiabilite: reliability, production: productionId, personnage: characterId, source: sourceId, periode: period !== "tout" ? period : undefined, q };
  const href = (patch: Record<string, string | undefined>) => {
    const merged = { ...current, ...patch };
    const qs = new URLSearchParams(Object.entries(merged).filter(([, v]) => v) as [string, string][]);
    return `/actualites${qs.size ? `?${qs}` : "?f=0"}`;
  };
  const pages = Math.ceil(res.total / PER_PAGE);
  const prodOptions = PRODUCTIONS.filter((p) => p.continuity === "mcu" || p.status !== "sorti").sort((a, b) => a.title.localeCompare(b.title, "fr"));

  return (
    <div className="mx-auto max-w-6xl">
      <Suspense><PersistFilters pageKey="actualites" /></Suspense>
      <PageHeader
        eyebrow="Fil d'information"
        title="Actualités"
        intro={<>Récupérées automatiquement depuis des sources publiques, puis classées : <ReliabilityBadge value="officiel" /> <ReliabilityBadge value="reporte" /> <ReliabilityBadge value="rumeur" /> <ReliabilityBadge value="theorie" />. Un sujet repris par plusieurs médias n'est affiché qu'une fois et ne compte pas comme plusieurs confirmations. <Link href="/sources" className="underline">Méthode</Link></>}
      />

      <div className="panel mb-6 space-y-3 p-3 md:p-4">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          <FilterLink href={href({ fiabilite: undefined })} active={!reliability}>Toute fiabilité</FilterLink>
          {(Object.keys(RELIABILITY) as Reliability[]).map((r) => <FilterLink key={r} href={href({ fiabilite: r })} active={reliability === r}>{RELIABILITY[r].label}</FilterLink>)}
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          <FilterLink href={href({ categorie: undefined })} active={!category}>Toutes catégories</FilterLink>
          {(Object.keys(NEWS_CATEGORY_LABELS) as NewsCategory[]).map((c) => <FilterLink key={c} href={href({ categorie: c })} active={category === c}>{NEWS_CATEGORY_LABELS[c]}</FilterLink>)}
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {Object.entries(PERIODS).map(([k, v]) => <FilterLink key={k} href={href({ periode: k === "tout" ? undefined : k })} active={period === k}>{v.label}</FilterLink>)}
        </div>
        <form action="/actualites" className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
          {category && <input type="hidden" name="categorie" value={category} />}
          {reliability && <input type="hidden" name="fiabilite" value={reliability} />}
          {period !== "tout" && <input type="hidden" name="periode" value={period} />}
          {characterId && <input type="hidden" name="personnage" value={characterId} />}
          <input name="q" defaultValue={q} placeholder="Mot-clé…" className="input" aria-label="Mot-clé" />
          <select name="production" defaultValue={productionId ?? ""} className="input" aria-label="Production">
            <option value="">Toutes les productions</option>
            {prodOptions.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <select name="source" defaultValue={sourceId ?? ""} className="input" aria-label="Source">
            <option value="">Toutes les sources</option>
            {NEWS_SOURCES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="btn btn-primary" type="submit">Filtrer</button>
        </form>
        {(productionId || characterId || q || sourceId) && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-steel-400">
            Filtres actifs :
            {productionId && <Link href={href({ production: undefined })} className="chip chip-active">{productionById.get(productionId)!.title} ✕</Link>}
            {characterId && <Link href={href({ personnage: undefined })} className="chip chip-active">{characterById.get(characterId)!.name} ✕</Link>}
            {sourceId && <Link href={href({ source: undefined })} className="chip chip-active">{NEWS_SOURCES.find((s) => s.id === sourceId)!.name} ✕</Link>}
            {q && <Link href={href({ q: undefined })} className="chip chip-active">« {q} » ✕</Link>}
            <Link href="/actualites?f=0" className="underline hover:text-white">Tout effacer</Link>
          </div>
        )}
      </div>

      {res.error && <p className="mb-4 rounded-lg border border-hq-red/40 bg-hq-red/10 p-3 text-sm">La base de données est indisponible : les actualités ne peuvent pas être affichées.</p>}
      {res.items.length ? (
        <div className="space-y-2.5">{res.items.map((a) => <ArticleCard key={a.id} a={a} clusterSize={res.sizes[a.clusterId]} />)}</div>
      ) : (
        <EmptyState title="Aucun article pour ces filtres">Élargissez la période ou retirez un filtre.</EmptyState>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-between gap-2" aria-label="Pagination">
          {page > 1 ? <Link className="btn" href={href({ page: String(page - 1) } as Record<string, string>)}>← Plus récents</Link> : <span />}
          <span className="text-xs text-steel-400">Page {page} / {pages} · {res.total} articles</span>
          {page < pages ? <Link className="btn" href={href({ page: String(page + 1) } as Record<string, string>)}>Plus anciens →</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
