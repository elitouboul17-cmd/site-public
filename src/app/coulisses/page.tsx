import type { Metadata } from "next";
import Link from "next/link";
import { BEHIND_THE_SCENES, BTS_CATEGORIES, productionById, personSlug } from "@/lib/catalog";
import { safeArticles } from "@/lib/news";
import type { BtsCategory } from "@/lib/types";
import { ArticleCard } from "@/components/ArticleCard";
import { FilterLink, PageHeader, SourceList, SectionTitle, EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Coulisses et fabrication" };
export const dynamic = "force-dynamic";

export default async function BehindTheScenesPage({ searchParams }: { searchParams: Promise<{ categorie?: string }> }) {
  const { categorie } = await searchParams;
  const cat = BTS_CATEGORIES.find((c) => c.id === categorie);
  const items = BEHIND_THE_SCENES.filter((b) => !cat || b.category === cat.id);
  // Actualités de fabrication récentes (interviews, featurettes, scènes coupées…) repérées par mots-clés.
  const keywords = cat ? cat.keywords : ["behind the scenes", "making of", "interview", "vfx", "deleted scene", "composer", "cinematographer", "stunt", "costume"];
  const results = await Promise.all(keywords.slice(0, 6).map((k) => safeArticles({ q: k, limit: 6 })));
  const seen = new Set<string>();
  const related = results.flatMap((r) => r.items).filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true))).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 8);

  const counts = new Map<BtsCategory, number>();
  for (const b of BEHIND_THE_SCENES) counts.set(b.category, (counts.get(b.category) ?? 0) + 1);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Fabrication"
        title="Coulisses"
        intro="Comment les productions Marvel sont fabriquées : réalisation, effets visuels, capture de performance, musique, costumes, décors, cascades… Chaque fiche cite des faits documentés et renvoie à ses sources. Les documentaires officiels (Marvel Studios: Assembled) et les interviews de professionnels sont à privilégier."
      />
      <div className="no-scrollbar panel mb-6 flex flex-wrap gap-1.5 p-3">
        <FilterLink href="/coulisses" active={!cat}>Toutes ({BEHIND_THE_SCENES.length})</FilterLink>
        {BTS_CATEGORIES.map((c) => <FilterLink key={c.id} href={`/coulisses?categorie=${c.id}`} active={cat?.id === c.id}>{c.label}{counts.get(c.id) ? ` (${counts.get(c.id)})` : ""}</FilterLink>)}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.length ? items.map((b) => (
            <article key={b.id} id={b.id} className="panel scroll-mt-24 p-4 md:p-5">
              <p className="eyebrow text-hq-red">{BTS_CATEGORIES.find((c) => c.id === b.category)?.label}</p>
              <h2 className="mt-1 text-lg font-semibold text-white">{b.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-steel-300">{b.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {b.productionIds.map((id) => <Link key={id} href={`/productions/${id}`} className="chip hover:border-white/30">{productionById.get(id)?.title ?? id}</Link>)}
                {(b.personIds ?? []).map((n) => <Link key={n} href={`/equipes/${personSlug(n)}`} className="chip text-steel-300 hover:border-white/30">{n}</Link>)}
              </div>
              <div className="mt-3 border-t border-white/5 pt-3"><SourceList sources={b.sources} /></div>
            </article>
          )) : (
            <EmptyState title="Pas encore de fiche dans cette catégorie">Les nouveautés (interviews, featurettes, scènes coupées) apparaissent dans la colonne « Récemment dans l'actualité » dès qu'une source les publie.</EmptyState>
          )}
        </div>
        <aside>
          <SectionTitle title="Récemment dans l'actualité" />
          <p className="mb-3 text-xs text-steel-500">Articles détectés automatiquement par mots-clés de fabrication{cat ? ` (${cat.label.toLowerCase()})` : ""}.</p>
          {related.length ? <div className="space-y-2">{related.map((a) => <ArticleCard key={a.id} a={a} compact />)}</div> : <p className="text-sm text-steel-500">Aucun article correspondant pour l'instant.</p>}
        </aside>
      </div>
    </div>
  );
}
