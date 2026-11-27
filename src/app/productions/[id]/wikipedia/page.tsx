import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { productionById } from "@/lib/catalog";
import { fetchArticle } from "@/lib/wikipedia";
import { themeVars } from "@/lib/theme";
import { formatDateTime } from "@/lib/text";

type Params = Promise<{ id: string }>;
// Rendu à la demande : seul le contenu Wikipédia réussi est mis en cache (24 h, dans fetchArticle) ;
// un échec passager n'est jamais mémorisé.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = productionById.get((await params).id);
  return { title: p ? `${p.title} — article Wikipédia` : "Article introuvable" };
}

export default async function WikipediaArticlePage({ params }: { params: Params }) {
  const { id } = await params;
  const p = productionById.get(id);
  if (!p?.wikipedia?.fr) notFound();
  const article = await fetchArticle(p.wikipedia.fr);

  return (
    <div className="themed mx-auto max-w-3xl" style={themeVars(p)}>
      <nav className="mb-4 text-xs text-steel-400">
        <Link href={`/productions/${p.id}`} className="hover:text-white">← {p.title}</Link>
      </nav>
      <p className="eyebrow mb-2 flex items-center gap-1.5 text-[var(--accent-text,#ff3b40)]"><BookOpen className="h-3.5 w-3.5" /> Article complet</p>
      <h1 className="display text-3xl leading-none text-white md:text-4xl">{article?.title ?? p.title}</h1>

      {!article ? (
        <p className="panel mt-6 p-4 text-sm text-steel-300">L'article n'a pas pu être chargé pour le moment (Wikipédia indisponible). Réessayez plus tard.</p>
      ) : (
        <>
          <p className="mt-3 text-xs text-steel-400">Texte de Wikipédia en français, sans tableaux ni notes. Les titres en couleur ouvrent leur fiche dans l'appli.</p>
          <article className="wiki-article mt-6" dangerouslySetInnerHTML={{ __html: article.html }} />
          <footer className="panel mt-10 p-4 text-[11px] leading-relaxed text-steel-400">
            Texte issu de l'article <a href={article.url} target="_blank" rel="noopener noreferrer" className="underline">« {article.title} »</a> de Wikipédia en français,
            rédigé par ses <a href={article.historyUrl} target="_blank" rel="noopener noreferrer" className="underline">contributeurs</a>, sous licence{" "}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr" target="_blank" rel="noopener noreferrer" className="underline">CC BY-SA 4.0</a>.
            Mise en forme adaptée (tableaux, images et notes retirés). Version {article.revid}, chargée le {formatDateTime(article.fetchedAt)} ; actualisée chaque jour.
          </footer>
        </>
      )}
    </div>
  );
}
