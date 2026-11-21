import Link from "next/link";
import { CalendarDays, Radio } from "lucide-react";
import { PRODUCTIONS, productionById, calendarEntries } from "@/lib/catalog";
import { groupedArticles, safeArticles, trendingProductionIds } from "@/lib/news";
import { listProductionMedia } from "@/lib/db/repo";
import { posterUrl } from "@/lib/media";
import { ArticleCard } from "@/components/ArticleCard";
import { ProductionCard } from "@/components/ProductionCard";
import { Dashboard, FavoritesWidget } from "@/components/Dashboard";
import { EmptyState, SectionTitle, CertaintyBadge } from "@/components/ui";
import { CALENDAR_KIND_LABELS } from "@/lib/labels";
import { formatDate, relativeTime } from "@/lib/text";

export const dynamic = "force-dynamic";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default async function Home() {
  const now = today();
  const [latest, official, rumors, trailers, trending, media] = await Promise.all([
    groupedArticles({ limit: 24 }),
    safeArticles({ reliability: "officiel", limit: 5 }),
    safeArticles({ reliability: "rumeur", limit: 4 }),
    safeArticles({ trailersOnly: true, limit: 4 }),
    trendingProductionIds(30, 6),
    listProductionMedia(),
  ]);
  const theories = await safeArticles({ reliability: "theorie", limit: 2 });

  const upcoming = PRODUCTIONS.filter((p) => p.releaseDate && p.releaseDate.length === 10 && p.releaseDate >= now && p.kind !== "comic")
    .sort((a, b) => a.releaseDate!.localeCompare(b.releaseDate!))
    .slice(0, 6);
  const undated = PRODUCTIONS.filter((p) => p.status !== "sorti" && !p.releaseDate && p.continuity === "mcu").slice(0, 4);
  const recent = PRODUCTIONS.filter((p) => p.releaseDate && p.releaseDate.length === 10 && p.releaseDate < now && p.kind !== "comic")
    .sort((a, b) => b.releaseDate!.localeCompare(a.releaseDate!))
    .slice(0, 6);
  const events = calendarEntries().filter((e) => (e.endDate ?? e.date) >= now).slice(0, 5);
  const lastUpdate = latest.items[0]?.fetchedAt;
  const poster = (id: string) => posterUrl(media[id]);

  const newsList = (items: typeof latest.items, empty: React.ReactNode, sizes: Record<string, number> = {}) =>
    items.length ? <div className="space-y-2">{items.map((a) => <ArticleCard key={a.id} a={a} compact clusterSize={sizes[a.clusterId]} />)}</div> : empty;

  const noNews = (
    <EmptyState title="Aucune actualité pour le moment">
      {latest.error ? "La base de données est indisponible." : <>Lancez une première récupération : <code className="text-steel-200">npm run ingest</code>.</>}
    </EmptyState>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <section className="panel hud-corners hud-grid relative mb-8 overflow-hidden p-5 md:p-8">
        <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-hq-red/20 blur-3xl" />
        <p className="eyebrow text-hq-red">Centre de contrôle</p>
        <h1 className="display mt-2 text-4xl leading-[0.9] text-white md:text-6xl">Bienvenue au QG</h1>
        <p className="mt-3 max-w-2xl text-sm text-steel-300 md:text-base">
          Actualités sourcées et classées par fiabilité, encyclopédie du MCU et de l'univers Marvel étendu, chronologies, coulisses et votre bibliothèque personnelle.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-steel-400">
          <span className="chip"><Radio className="h-3 w-3 text-officiel" /> {latest.total} articles suivis</span>
          {lastUpdate && <span className="chip">Dernière récupération {relativeTime(lastUpdate)}</span>}
          <Link href="/sources" className="chip hover:border-white/30">Comment l'information est classée</Link>
        </div>
      </section>

      <Dashboard
        widgets={{
          sorties: (
            <>
              <SectionTitle title="Prochaines sorties" href="/calendrier" linkLabel="Calendrier" />
              {upcoming.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {upcoming.map((p) => <ProductionCard key={p.id} p={p} posterUrl={poster(p.id)} />)}
                </div>
              ) : <EmptyState title="Aucune sortie datée à venir" />}
              {undated.length > 0 && (
                <p className="mt-3 text-xs text-steel-400">
                  Annoncés sans date confirmée : {undated.map((p, i) => <span key={p.id}>{i ? ", " : ""}<Link className="text-steel-200 hover:text-white" href={`/productions/${p.id}`}>{p.title}</Link></span>)}.
                </p>
              )}
            </>
          ),
          officiel: (<><SectionTitle title="Annonces officielles" href="/actualites?fiabilite=officiel" />{newsList(official.items, <EmptyState title="Aucune annonce officielle récente" />)}</>),
          actus: (<><SectionTitle title="Dernières actualités" href="/actualites" />{newsList(latest.items.slice(0, 6), noNews, latest.sizes)}</>),
          "bandes-annonces": (
            <>
              <SectionTitle title="Bandes-annonces récentes" href="/actualites?categorie=bandes-annonces" />
              {newsList(trailers.items, <EmptyState title="Aucune bande-annonce récente">Les vidéos de la chaîne officielle nécessitent une clé YouTube Data API (voir la documentation).</EmptyState>)}
            </>
          ),
          rumeurs: (
            <>
              <SectionTitle title="Rumeurs et théories" href="/actualites?fiabilite=rumeur" />
              <p className="mb-2 text-xs text-rumeur">Informations non confirmées, affichées séparément des annonces.</p>
              {newsList([...rumors.items, ...theories.items], <EmptyState title="Aucune rumeur récente" />)}
            </>
          ),
          favoris: (
            <>
              <SectionTitle title="Mes favoris" href="/bibliotheque" linkLabel="Ma bibliothèque" />
              <FavoritesWidget items={PRODUCTIONS.map((p) => ({ id: p.id, title: p.title }))} />
            </>
          ),
          evenements: (
            <>
              <SectionTitle title="Prochains événements" href="/calendrier" />
              {events.length ? (
                <ul className="panel divide-y divide-white/5">
                  {events.map((e) => (
                    <li key={e.id} className="flex items-center gap-3 p-3">
                      <CalendarDays className="h-4 w-4 shrink-0 text-hq-red" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{e.productionId ? <Link href={`/productions/${e.productionId}`} className="hover:underline">{e.title}</Link> : e.title}</p>
                        <p className="text-xs text-steel-400">{CALENDAR_KIND_LABELS[e.kind]} · {formatDate(e.date)}</p>
                      </div>
                      <CertaintyBadge certainty={e.certainty} date={e.date} />
                    </li>
                  ))}
                </ul>
              ) : <EmptyState title="Aucun événement daté à venir" />}
            </>
          ),
          ajouts: (
            <>
              <SectionTitle title="Sorties récentes" href="/mcu" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{recent.map((p) => <ProductionCard key={p.id} p={p} posterUrl={poster(p.id)} />)}</div>
            </>
          ),
          populaires: (
            <>
              <SectionTitle title="Productions les plus citées (30 jours)" />
              {trending.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {trending.map(({ id, count }) => {
                    const p = productionById.get(id);
                    return p ? (
                      <div key={id}>
                        <ProductionCard p={p} posterUrl={poster(id)} />
                        <p className="mt-1 text-center text-[11px] text-steel-400">{count} sujet{count > 1 ? "s" : ""} d'actualité</p>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : <EmptyState title="Pas encore assez d'actualités pour mesurer la popularité" />}
            </>
          ),
        }}
      />
    </div>
  );
}
