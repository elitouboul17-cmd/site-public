import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clapperboard, Link2 } from "lucide-react";
import {
  PRODUCTIONS, productionById, charactersForProduction, relatedProductions, personSlug, verificationFor,
  BEHIND_THE_SCENES, BTS_CATEGORIES, TIMELINE,
} from "@/lib/catalog";
import { CONTINUITY_LABELS, KIND_LABELS, STATUS_LABELS } from "@/lib/labels";
import { formatDate, formatRuntime, formatDateTime } from "@/lib/text";
import { listProductionMedia } from "@/lib/db/repo";
import { groupedArticles } from "@/lib/news";
import { posterUrl } from "@/lib/media";
import { Poster } from "@/components/Poster";
import { ArticleCard } from "@/components/ArticleCard";
import { CertaintyBadge, SectionTitle, SourceList, VerificationBadge } from "@/components/ui";
import { ProductionLibraryControls, SpoilerGuard, TrackView } from "@/components/LibraryControls";
import { VideoGallery } from "@/components/VideoGallery";
import { detailsFor, formatUsd } from "@/lib/details";
import { themeFor, themeVars } from "@/lib/theme";
import { MusicSection } from "@/components/MusicLinks";
import { PersonAvatar } from "@/components/PersonAvatar";
import { RemoteImage } from "@/components/RemoteImage";
import { FEATURED_TRACKS } from "@/data/music";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return PRODUCTIONS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = productionById.get((await params).id);
  return p ? { title: p.title, description: p.synopsis } : { title: "Production introuvable" };
}

export const dynamicParams = false;
export const revalidate = 300;

function People({ label, names }: { label: string; names?: string[] }) {
  if (!names?.length) return null;
  return (
    <div>
      <dt className="eyebrow mb-1">{label}</dt>
      <dd className="text-sm text-white">
        {names.map((n, i) => (
          <span key={n}>{i ? ", " : ""}<Link className="hover:text-hq-red hover:underline" href={`/equipes/${personSlug(n)}`}>{n}</Link></span>
        ))}
      </dd>
    </div>
  );
}

export default async function ProductionPage({ params }: { params: Params }) {
  const { id } = await params;
  const p = productionById.get(id);
  if (!p) notFound();
  const [media, news] = await Promise.all([listProductionMedia(), groupedArticles({ productionId: p.id, limit: 30 })]);
  const m = media[p.id];
  const characters = charactersForProduction(p);
  const related = relatedProductions(p);
  const bts = BEHIND_THE_SCENES.filter((b) => b.productionIds.includes(p.id));
  const events = TIMELINE.filter((t) => t.productionIds.includes(p.id));
  const verification = verificationFor(p.id);
  const tmdb = detailsFor(p.id);
  // Vidéos officielles : TMDB (YouTube officiel), complétées par les vidéos de la chaîne officielle récupérées dans l'actualité.
  const newsVideos = news.items.filter((a) => a.isTrailer && a.youtubeId && a.sourceTier === "officielle").map((a) => ({ key: a.youtubeId!, name: a.title, type: "Trailer", lang: "en", published: a.publishedAt.slice(0, 10) }));
  const videos = [...(tmdb?.videos ?? []), ...newsVideos.filter((v) => !tmdb?.videos.some((t) => t.key === v.key))];
  const isSeries = p.kind === "serie" || p.kind === "serie-animee";
  const theme = themeFor(p);

  return (
    <div className="themed relative isolate mx-auto max-w-6xl" style={themeVars(p)}>
      {/* Halo aux couleurs de l'œuvre */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[520px] opacity-70 blur-3xl"
        style={{ background: `radial-gradient(40% 50% at 25% 40%, color-mix(in srgb, ${theme.colors[0]} 45%, transparent), transparent 70%), radial-gradient(35% 45% at 75% 30%, color-mix(in srgb, ${theme.colors[1]} 30%, transparent), transparent 70%)` }} />
      {m?.backdropPath && (
        // Image de fond TMDB (usage non commercial, attribution affichée sous l'affiche)
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-6 -z-10 h-[420px] overflow-hidden rounded-2xl opacity-35 [mask-image:linear-gradient(to_bottom,black_30%,transparent)]">
          <RemoteImage src={`https://image.tmdb.org/t/p/w1280${m.backdropPath}`} className="h-full w-full object-cover" />
        </div>
      )}
      <TrackView kind="production" id={p.id} title={p.title} href={`/productions/${p.id}`} />
      <nav className="mb-4 text-xs text-steel-400" aria-label="Fil d'Ariane">
        <Link href={p.continuity === "mcu" ? "/mcu" : "/univers"} className="hover:text-white">{p.continuity === "mcu" ? "Univers MCU" : "Univers étendu"}</Link>
        <span className="mx-1.5">/</span><span className="text-steel-200">{p.title}</span>
      </nav>

      <div className="grid gap-6 md:grid-cols-[260px_1fr] lg:gap-10">
        <div className="mx-auto w-48 md:w-full">
          <Poster p={p} src={posterUrl(m, "w500")} size="lg" className="shadow-2xl shadow-hq-red/10" />
          {m?.posterPath && <p className="mt-2 text-[10px] text-steel-500">Affiche et image de fond : The Movie Database (TMDB). Ce produit utilise l'API TMDB sans être approuvé ni certifié par TMDB.</p>}
        </div>

        <div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            <span className="chip chip-active">{KIND_LABELS[p.kind]}</span>
            <Link href={p.continuity === "mcu" ? "/mcu" : `/univers?continuite=${p.continuity}`} className="chip hover:border-white/30" title={CONTINUITY_LABELS[p.continuity].description}>{CONTINUITY_LABELS[p.continuity].label}</Link>
            {p.phase && <Link href={`/mcu?phase=${p.phase}&tri=phase`} className="chip hover:border-white/30">Phase {p.phase}</Link>}
            {p.saga && <span className="chip">{p.saga}</span>}
            {p.status !== "sorti" && <span className="chip border-hq-red/50 text-hq-red">{STATUS_LABELS[p.status]}</span>}
          </div>
          <h1 className="display text-3xl leading-none text-white md:text-5xl">{p.title}</h1>
          <div className="mt-3 h-1 w-40 rounded-full" style={{ background: `linear-gradient(90deg, ${theme.colors.join(", ")})` }} aria-hidden />
          {p.originalTitle !== p.title && <p className="mt-2 text-sm text-steel-400">Titre original : <span className="text-steel-200">{p.originalTitle}</span></p>}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <CertaintyBadge certainty={p.dateCertainty} date={p.releaseDate} />
            {p.releaseDateFr && <span className="chip">France : {formatDate(p.releaseDateFr)}</span>}
            {p.endDate && <span className="chip">Fin : {formatDate(p.endDate)}</span>}
            {formatRuntime(p.runtime) && <span className="chip">{formatRuntime(p.runtime)}</span>}
            {p.seasons && <span className="chip">{p.seasons} saison{p.seasons > 1 ? "s" : ""}</span>}
            {p.episodes && <span className="chip">{p.episodes} épisodes</span>}
            {p.platform && <span className="chip">{p.platform}</span>}
            <VerificationBadge record={verification} />
          </div>

          {p.synopsis && <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-steel-200">{p.synopsis}</p>}
          {!p.synopsis && <p className="mt-5 text-sm text-steel-500">Synopsis non renseigné : aucune information vérifiée disponible pour l'instant.</p>}

          <div className="mt-5 flex flex-wrap gap-2">
            {videos.length > 0 && <a href="#videos" className="btn">▶ Bandes-annonces ({videos.length})</a>}
            {p.wikipedia?.fr && <Link href={`/productions/${p.id}/wikipedia`} className="btn">📖 Lire l'article complet</Link>}
            {tmdb?.revenue ? <span className="chip">Box-office : {formatUsd(tmdb.revenue)}</span> : null}
          </div>

          <div className="panel mt-6 p-4"><ProductionLibraryControls id={p.id} episodes={isSeries ? p.episodes : undefined} /></div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="min-w-0 space-y-10 lg:col-span-2">
          {videos.length > 0 && (
            <section id="videos" className="scroll-mt-24">
              <SectionTitle title={`Bandes-annonces et vidéos (${videos.length})`} />
              <VideoGallery videos={videos} title={p.title} />
            </section>
          )}

          {(p.composers?.length || FEATURED_TRACKS[p.id]) && p.kind !== "comic" ? (
            <section id="musique" className="scroll-mt-24">
              <SectionTitle title="Musique" href="/musique" linkLabel="Toutes les BO" />
              <MusicSection p={p} />
            </section>
          ) : null}

          {p.cast?.length ? (
            <section>
              <SectionTitle title="Distribution" />
              <ul className="grid gap-2 sm:grid-cols-2">
                {p.cast.map(([person, role, cid]) => (
                  <li key={person + role} className="panel flex items-center gap-3 p-3">
                    <PersonAvatar id={personSlug(person)} name={person} size={44} />
                    <div className="min-w-0">
                      <Link href={`/equipes/${personSlug(person)}`} className="block truncate text-sm font-semibold text-white hover:underline">{person}</Link>
                      <p className="truncate text-xs text-steel-400">{cid ? <Link href={`/personnages/${cid}`} className="hover:text-white hover:underline">{role}</Link> : role}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-steel-500">Distribution principale ; liste non exhaustive.</p>
            </section>
          ) : null}

          {characters.length > 0 && (
            <section>
              <SectionTitle title="Personnages" />
              <div className="flex flex-wrap gap-1.5">{characters.map((c) => <Link key={c.id} href={`/personnages/${c.id}`} className="chip hover:border-white/30">{c.name}</Link>)}</div>
            </section>
          )}

          {related.length > 0 && (
            <section>
              <SectionTitle title="Connexions confirmées" />
              <SpoilerGuard productionIds={[p.id]}>
                <ul className="space-y-2">
                  {related.map(({ production: r, nature }) => (
                    <li key={r.id} className="panel flex gap-3 p-3">
                      <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-hq-red" />
                      <div>
                        <Link href={`/productions/${r.id}`} className="text-sm font-semibold text-white hover:underline">{r.title}</Link>
                        <span className="ml-2 text-[11px] text-steel-500">{CONTINUITY_LABELS[r.continuity].short}</span>
                        <p className="text-xs text-steel-300">{nature}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </SpoilerGuard>
            </section>
          )}

          {events.length > 0 && (
            <section>
              <SectionTitle title="Dans la chronologie" href="/chronologie" />
              <ul className="space-y-2">
                {events.map((e) => (
                  <li key={e.id} className="panel p-3">
                    <p className="text-xs font-semibold text-hq-red">{e.when}</p>
                    {e.spoiler ? (
                      <SpoilerGuard productionIds={e.productionIds} force><p className="text-sm font-semibold text-white">{e.title}</p><p className="text-xs text-steel-300">{e.description}</p></SpoilerGuard>
                    ) : (<><p className="text-sm font-semibold text-white">{e.title}</p><p className="text-xs text-steel-300">{e.description}</p></>)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {bts.length > 0 && (
            <section>
              <SectionTitle title="Coulisses" href="/coulisses" />
              <ul className="space-y-2">
                {bts.map((b) => (
                  <li key={b.id} className="panel p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-steel-400"><Clapperboard className="h-3.5 w-3.5 text-hq-red" />{BTS_CATEGORIES.find((c) => c.id === b.category)?.label}</p>
                    <Link href={`/coulisses#${b.id}`} className="text-sm font-semibold text-white hover:underline">{b.title}</Link>
                    <p className="mt-1 text-xs leading-relaxed text-steel-300">{b.summary}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <SectionTitle title="Actualités liées" href={`/actualites?production=${p.id}`} />
            {news.items.length ? (
              <SpoilerGuard productionIds={[p.id]} label="Actualités masquées (mode sans spoilers)">
                <div className="space-y-2">{news.items.slice(0, 8).map((a) => <ArticleCard key={a.id} a={a} clusterSize={news.sizes[a.clusterId]} />)}</div>
              </SpoilerGuard>
            ) : <p className="text-sm text-steel-500">Aucun article récupéré ne mentionne cette production pour l'instant.</p>}
          </section>
        </div>

        <aside className="space-y-6">
          {(tmdb?.budget || tmdb?.revenue) && (
            <div className="panel p-4">
              <p className="eyebrow mb-3">Box-office</p>
              <dl className="grid grid-cols-2 gap-3">
                <div><dt className="text-[11px] text-steel-400">Budget estimé</dt><dd className="display text-xl text-white">{formatUsd(tmdb.budget)}</dd></div>
                <div><dt className="text-[11px] text-steel-400">Recettes mondiales</dt><dd className="display text-xl text-[var(--accent-text,#fff)]">{formatUsd(tmdb.revenue)}</dd></div>
              </dl>
              {tmdb.budget && tmdb.revenue ? (
                <>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden>
                    <div className="h-full rounded-full bg-[var(--accent,#e62429)]" style={{ width: `${Math.min(100, (tmdb.budget / tmdb.revenue) * 100)}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-steel-300">Les recettes représentent <strong className="text-white">{(tmdb.revenue / tmdb.budget).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} fois</strong> le budget (hors marketing).</p>
                </>
              ) : null}
              <p className="mt-2 text-[10px] text-steel-500">Source : TMDB (base collaborative), en dollars US non corrigés de l'inflation. Les budgets sont des estimations, rarement publiés par les studios. <a className="underline" href="/box-office">Classement complet</a></p>
            </div>
          )}

          {tmdb?.watch && (tmdb.watch.flatrate.length + tmdb.watch.rent.length + tmdb.watch.buy.length + tmdb.watch.free.length > 0) && (
            <div className="panel p-4">
              <p className="eyebrow mb-3">Où regarder en France</p>
              {([["Abonnement", tmdb.watch.flatrate], ["Gratuit", tmdb.watch.free], ["Location", tmdb.watch.rent], ["Achat", tmdb.watch.buy]] as const).map(([label, list]) => list.length ? (
                <div key={label} className="mb-2">
                  <p className="mb-1 text-[11px] text-steel-400">{label}</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {list.slice(0, 8).map((pr) => (
                      <li key={pr.name} title={pr.name} className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] py-1 pr-2 pl-1 text-[11px] text-steel-200">
                        {pr.logo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`https://image.tmdb.org/t/p/w45${pr.logo}`} alt="" className="h-5 w-5 rounded" loading="lazy" />
                        )}
                        {pr.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null)}
              <p className="mt-2 text-[10px] text-steel-500">Disponibilités fournies par JustWatch via TMDB, mises à jour le {new Date(tmdb.fetchedAt).toLocaleDateString("fr-FR")}. Elles changent souvent.</p>
            </div>
          )}

          <dl className="panel space-y-4 p-4">
            <People label="Réalisation" names={p.directors} />
            <People label={isSeries ? "Création / scénario" : "Scénario"} names={p.writers} />
            <People label="Musique" names={p.composers} />
            <People label="Production" names={p.producers} />
            <People label="Direction de la photographie" names={p.cinematographers} />
            <People label="Montage" names={p.editors} />
            {p.studios?.length ? <div><dt className="eyebrow mb-1">Studios</dt><dd className="text-sm text-white">{p.studios.join(", ")}</dd></div> : null}
            {p.distributor && <div><dt className="eyebrow mb-1">Distribution</dt><dd className="text-sm text-white">{p.distributor}</dd></div>}
            {p.vfxVendors?.length ? <div><dt className="eyebrow mb-1">Effets visuels (studios principaux)</dt><dd className="text-sm text-white">{p.vfxVendors.join(", ")}</dd></div> : null}
            {p.narrativeEra && <div><dt className="eyebrow mb-1">Époque narrative</dt><dd className="text-sm text-white">{p.narrativeEra}</dd></div>}
          </dl>

          <div className="panel space-y-3 p-4">
            <SourceList sources={p.sources} />
            <div className="border-t border-white/5 pt-3">
              <p className="eyebrow mb-1.5">Palette de la fiche</p>
              <div className="flex gap-1.5" aria-hidden>{theme.colors.map((c) => <span key={c} className="h-6 w-6 rounded-md border border-white/15" style={{ background: c }} title={c} />)}</div>
              <p className="mt-1.5 text-[11px] text-steel-400">{theme.mood}</p>
            </div>
            {verification && (
              <div className="border-t border-white/5 pt-3">
                <p className="eyebrow mb-1.5">Contrôle automatique</p>
                <p className="mb-2 text-[11px] text-steel-400">Confronté le {formatDateTime(verification.checkedAt)} à l'infobox Wikipédia.</p>
                <ul className="space-y-1">
                  {verification.checks.map((c) => (
                    <li key={c.field} className={`text-[11px] ${c.ok ? "text-steel-400" : "text-rumeur"}`}>
                      {c.ok ? "✓" : "△"} {c.field}{!c.ok && <> — fiche : {c.ours ?? "—"} · référence : {c.reference ?? "—"}</>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
