import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ShieldCheck, Layers } from "lucide-react";
import { getArticle } from "@/lib/db/repo";
import { safeCluster } from "@/lib/news";
import { productionById, characterById } from "@/lib/catalog";
import { NEWS_CATEGORY_LABELS, RELIABILITY } from "@/lib/labels";
import { formatDateTime } from "@/lib/text";
import { ReliabilityBadge } from "@/components/ui";
import { SummaryNote } from "@/components/ArticleCard";
import { SaveArticleButton, SpoilerGuard, TrackView } from "@/components/LibraryControls";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { RemoteImage } from "@/components/RemoteImage";

export const dynamic = "force-dynamic";
type Params = Promise<{ id: string }>;

async function load(id: string) {
  if (!/^[a-f0-9]{20}$/.test(id)) return null;
  try {
    return await getArticle(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const a = await load((await params).id);
  return { title: a?.title ?? "Article introuvable" };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const a = await load((await params).id);
  if (!a) notFound();
  const cluster = (await safeCluster(a.clusterId)).filter((x) => x.id !== a.id);
  const officialInCluster = cluster.find((x) => x.reliability === "officiel");
  const distinctSources = new Set([a.sourceId, ...cluster.map((x) => x.sourceId)]).size;

  return (
    <div className="mx-auto max-w-3xl">
      <TrackView kind="article" id={a.id} title={a.title} href={`/actualites/${a.id}`} />
      <nav className="mb-4 text-xs text-steel-400"><Link href="/actualites" className="hover:text-white">Actualités</Link></nav>
      <article className="panel p-5 md:p-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <ReliabilityBadge value={a.reliability} />
          {a.categories.map((c) => <Link key={c} href={`/actualites?categorie=${c}`} className="chip hover:border-white/30">{NEWS_CATEGORY_LABELS[c]}</Link>)}
        </div>
        <h1 className="text-2xl leading-tight font-bold text-white md:text-3xl">{a.title}</h1>
        <p className="mt-2 text-sm text-steel-400">
          Source : <a href={a.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-steel-200 underline">{a.sourceName}</a>
        </p>

        {a.youtubeId && a.sourceTier === "officielle" ? (
          <div className="mt-5"><YouTubeEmbed id={a.youtubeId} title={a.title} /></div>
        ) : a.imageUrl ? (
          <RemoteImage src={a.imageUrl} className="mt-5 max-h-96 w-full rounded-lg object-cover" />
        ) : null}

        <SpoilerGuard productionIds={a.productionIds} label="Résumé masqué (mode sans spoilers)">
          <div className="mt-5 space-y-3">
            {a.summary ? <p className="text-[15px] leading-relaxed text-steel-100" lang={a.summaryLang}>{a.summary}</p> : <p className="text-sm text-steel-500">La source ne fournit pas de résumé.</p>}
            <SummaryNote a={a} />
            {a.summaryKind === "resume-ia" && a.originalExcerpt && (
              <details className="text-xs text-steel-400"><summary className="cursor-pointer">Extrait original ({a.sourceName})</summary><p className="mt-2 leading-relaxed" lang="en">{a.originalExcerpt}</p></details>
            )}
          </div>
        </SpoilerGuard>

        <div className="mt-6 flex flex-wrap gap-2">
          <a href={a.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Lire l'article original <ExternalLink className="h-4 w-4" /></a>
          <SaveArticleButton a={{ id: a.id, title: a.title, url: a.url, source: a.sourceName }} />
        </div>

        <dl className="mt-8 grid gap-4 border-t border-white/5 pt-5 text-sm sm:grid-cols-2">
          <div><dt className="eyebrow mb-1">Fiabilité</dt><dd className="text-steel-200">{RELIABILITY[a.reliability].description}<br /><span className="text-xs text-steel-400">{a.reliabilityReason}</span></dd></div>
          <div><dt className="eyebrow mb-1">Dates</dt><dd className="space-y-0.5 text-xs text-steel-300">
            <p>Publié : {formatDateTime(a.publishedAt)}</p>
            <p>Récupéré : {formatDateTime(a.fetchedAt)}</p>
            <p>Dernière vérification : {formatDateTime(a.lastCheckedAt)}</p>
            {a.updatedAt && <p className="text-rumeur">Modifié par la source : {formatDateTime(a.updatedAt)} (révision {a.revision})</p>}
          </dd></div>
          {a.productionIds.length > 0 && <div><dt className="eyebrow mb-1">Productions concernées</dt><dd className="flex flex-wrap gap-1.5">{a.productionIds.map((id) => <Link key={id} href={`/productions/${id}`} className="chip hover:border-white/30">{productionById.get(id)?.title ?? id}</Link>)}</dd></div>}
          {a.characterIds.length > 0 && <div><dt className="eyebrow mb-1">Personnages concernés</dt><dd className="flex flex-wrap gap-1.5">{a.characterIds.map((id) => <Link key={id} href={`/personnages/${id}`} className="chip hover:border-white/30">{characterById.get(id)?.name ?? id}</Link>)}</dd></div>}
        </dl>
        <p className="mt-4 text-[11px] text-steel-500">Association automatique par mots-clés : elle peut être incomplète. Le contenu complet et les droits appartiennent à {a.sourceName}.</p>
      </article>

      {cluster.length > 0 && (
        <section className="panel mt-6 p-5">
          <h2 className="display mb-1 flex items-center gap-2 text-base text-white"><Layers className="h-4 w-4 text-hq-red" /> Même sujet, autres sources ({distinctSources} au total)</h2>
          <p className="mb-3 text-xs text-steel-400">Ces articles traitent du même sujet. Plusieurs médias reprenant une même information ne constituent pas des confirmations indépendantes.</p>
          {officialInCluster && a.reliability !== "officiel" && (
            <p className="mb-3 flex items-center gap-2 rounded-lg border border-officiel/30 bg-officiel/5 p-2 text-xs text-officiel"><ShieldCheck className="h-4 w-4" /> Une source officielle ({officialInCluster.sourceName}) traite aussi ce sujet.</p>
          )}
          <ul className="space-y-2">
            {cluster.map((c) => (
              <li key={c.id} className="flex items-start gap-2 text-sm">
                <ReliabilityBadge value={c.reliability} />
                <Link href={`/actualites/${c.id}`} className="text-steel-200 hover:text-white hover:underline">{c.title}</Link>
                <span className="shrink-0 text-xs text-steel-500">{c.sourceName}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
