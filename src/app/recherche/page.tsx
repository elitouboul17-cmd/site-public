import type { Metadata } from "next";
import Link from "next/link";
import { searchCatalog, scoreText, SEARCH_KIND_LABELS, type SearchHit, type SearchKind } from "@/lib/search";
import { safeArticles } from "@/lib/news";
import { normalize } from "@/lib/text";
import { PageHeader, EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Recherche" };
export const dynamic = "force-dynamic";

const ORDER: SearchKind[] = ["film", "serie", "personnage", "acteur", "realisateur", "compositeur", "musique", "personne", "article", "evenement", "comic", "jeu", "coulisses"];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const { q = "", type } = await searchParams;
  const query = q.slice(0, 100).trim();
  let hits: SearchHit[] = query.length >= 2 ? searchCatalog(query, 200) : [];
  if (query.length >= 2) {
    const { items } = await safeArticles({ q: query, limit: 30 });
    const nq = normalize(query);
    hits = hits.concat(items.map((a) => ({ kind: "article" as const, id: a.id, title: a.title, href: `/actualites/${a.id}`, subtitle: `${a.sourceName} · ${a.publishedAt.slice(0, 10)}`, score: Math.max(scoreText(nq, [normalize(a.title)], normalize(a.summary)), 15) })));
  }
  const counts = new Map<SearchKind, number>();
  for (const h of hits) counts.set(h.kind, (counts.get(h.kind) ?? 0) + 1);
  const shown = type ? hits.filter((h) => h.kind === type) : hits;
  const groups = ORDER.map((k) => [k, shown.filter((h) => h.kind === k).sort((a, b) => b.score - a.score)] as const).filter(([, l]) => l.length);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Recherche globale" title={query ? `« ${query} »` : "Recherche"}>
        <form action="/recherche" className="flex max-w-xl gap-2" role="search">
          <input name="q" defaultValue={query} className="input" placeholder="Films, séries, personnages, acteurs, articles…" aria-label="Recherche" />
          <button className="btn btn-primary" type="submit">Chercher</button>
        </form>
      </PageHeader>
      {query.length >= 2 && (
        <div className="no-scrollbar mb-6 flex gap-1.5 overflow-x-auto">
          <Link href={`/recherche?q=${encodeURIComponent(query)}`} className={`chip ${!type ? "chip-active" : ""}`}>Tout ({hits.length})</Link>
          {ORDER.filter((k) => counts.get(k)).map((k) => (
            <Link key={k} href={`/recherche?q=${encodeURIComponent(query)}&type=${k}`} className={`chip ${type === k ? "chip-active" : ""}`}>{SEARCH_KIND_LABELS[k]} ({counts.get(k)})</Link>
          ))}
        </div>
      )}
      {query.length < 2 ? <EmptyState title="Saisissez au moins deux caractères" /> : !groups.length ? (
        <EmptyState title="Aucun résultat">Vérifiez l'orthographe ou essayez le titre original (anglais).</EmptyState>
      ) : (
        <div className="space-y-8">
          {groups.map(([k, list]) => (
            <section key={k}>
              <h2 className="display mb-2 text-base text-white">{SEARCH_KIND_LABELS[k]} <span className="text-steel-500">· {list.length}</span></h2>
              <ul className="panel divide-y divide-white/5">
                {list.slice(0, type ? 200 : 8).map((h) => (
                  <li key={h.kind + h.id}><Link href={h.href} className="block p-3 hover:bg-white/[0.03]"><span className="block text-sm font-semibold text-white">{h.title}</span><span className="block text-xs text-steel-400">{h.subtitle}</span></Link></li>
                ))}
              </ul>
              {!type && list.length > 8 && <Link href={`/recherche?q=${encodeURIComponent(query)}&type=${k}`} className="mt-2 inline-block text-xs font-semibold text-hq-red">Voir les {list.length} résultats</Link>}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
