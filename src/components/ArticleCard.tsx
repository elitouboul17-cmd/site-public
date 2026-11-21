import Link from "next/link";
import { Play, ExternalLink, Languages, Sparkles, Layers } from "lucide-react";
import type { Article } from "@/lib/types";
import { productionById } from "@/lib/catalog";
import { NEWS_CATEGORY_LABELS } from "@/lib/labels";
import { relativeTime, truncate } from "@/lib/text";
import { ReliabilityBadge } from "./ui";
import { SaveArticleButton } from "./LibraryControls";
import { RemoteImage } from "./RemoteImage";

export function SummaryNote({ a }: { a: Pick<Article, "summaryKind" | "summaryLang"> }) {
  if (a.summaryKind === "resume-ia")
    return <span className="inline-flex items-center gap-1 text-[10px] text-steel-500" title="Résumé traduit automatiquement à partir de l'extrait publié par la source. Se référer à l'article original."><Sparkles className="h-3 w-3" /> Résumé traduit (IA)</span>;
  if (a.summaryLang === "en")
    return <span className="inline-flex items-center gap-1 text-[10px] text-steel-500" title="Extrait original en anglais : aucun résumé français n'est généré sans service de traduction configuré."><Languages className="h-3 w-3" /> Extrait VO</span>;
  return null;
}

export function ArticleCard({ a, compact = false, clusterSize = 1 }: { a: Article; compact?: boolean; clusterSize?: number }) {
  const prods = a.productionIds.map((id) => productionById.get(id)).filter(Boolean).slice(0, 3);
  return (
    <article className="panel panel-hover group relative flex gap-3 p-3">
      {!compact && a.imageUrl && (
        <div className="relative hidden h-24 w-36 shrink-0 overflow-hidden rounded-lg bg-ink-700 sm:block">
          {/* Image fournie par le flux de la source, affichée depuis son serveur */}
          <RemoteImage src={a.imageUrl} className="h-full w-full object-cover" />
          {a.isTrailer && <span className="absolute inset-0 flex items-center justify-center bg-black/30"><Play className="h-7 w-7 fill-white text-white" /></span>}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-steel-400">
          <ReliabilityBadge value={a.reliability} />
          <span className="font-semibold text-steel-200">{a.sourceName}</span>
          <time dateTime={a.publishedAt}>{relativeTime(a.publishedAt)}</time>
          {clusterSize > 1 && <span className="inline-flex items-center gap-1" title="Plusieurs médias traitent ce sujet. Ce ne sont pas des confirmations indépendantes."><Layers className="h-3 w-3" />{clusterSize} sources</span>}
        </div>
        <h3 className="text-sm leading-snug font-semibold text-white md:text-[15px]">
          <Link href={`/actualites/${a.id}`} className="after:absolute after:inset-0 hover:underline">{a.title}</Link>
        </h3>
        {!compact && a.summary && <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-steel-300" lang={a.summaryLang}>{truncate(a.summary, 240)}</p>}
        <div className="relative z-10 mt-2 flex flex-wrap items-center gap-1.5">
          {prods.map((p) => (
            <Link key={p!.id} href={`/productions/${p!.id}`} className="chip hover:border-white/30">{p!.title}</Link>
          ))}
          {!compact && a.categories.slice(0, 2).map((c) => <span key={c} className="chip text-steel-400">{NEWS_CATEGORY_LABELS[c]}</span>)}
          {!compact && <SummaryNote a={a} />}
        </div>
      </div>
      <div className="relative z-10 flex shrink-0 flex-col items-center gap-1">
        <SaveArticleButton a={{ id: a.id, title: a.title, url: a.url, source: a.sourceName }} />
        <a href={a.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-steel-400 hover:bg-white/5 hover:text-white" aria-label={`Lire l'article original sur ${a.sourceName}`} title="Article original">
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}
