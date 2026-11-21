import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CHARACTERS, characterById, productionsForCharacter, personSlug } from "@/lib/catalog";
import { CHARACTER_KIND_LABELS, CONTINUITY_LABELS } from "@/lib/labels";
import { groupedArticles } from "@/lib/news";
import { listProductionMedia } from "@/lib/db/repo";
import { posterUrl } from "@/lib/media";
import { ProductionCard } from "@/components/ProductionCard";
import { ArticleCard } from "@/components/ArticleCard";
import { SectionTitle, SourceList } from "@/components/ui";
import { FollowCharacterButton, TrackView } from "@/components/LibraryControls";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return CHARACTERS.map((c) => ({ id: c.id }));
}
export const dynamicParams = false;
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const c = characterById.get((await params).id);
  return { title: c?.name ?? "Personnage introuvable" };
}

function CharLinks({ label, ids }: { label: string; ids?: string[] }) {
  const list = (ids ?? []).map((i) => characterById.get(i)).filter(Boolean);
  if (!list.length) return null;
  return (
    <div>
      <p className="eyebrow mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">{list.map((c) => <Link key={c!.id} href={`/personnages/${c!.id}`} className="chip hover:border-white/30">{c!.name}</Link>)}</div>
    </div>
  );
}

export default async function CharacterPage({ params }: { params: Params }) {
  const { id } = await params;
  const c = characterById.get(id);
  if (!c) notFound();
  const productions = productionsForCharacter(c);
  const [media, news] = await Promise.all([listProductionMedia(), groupedArticles({ characterId: c.id, limit: 20 })]);
  // Relations inverses : qui cite ce personnage comme allié, ennemi ou membre ?
  const members = CHARACTERS.filter((o) => o.affiliations?.includes(c.id));
  const reverseRelations = CHARACTERS.flatMap((o) => (o.relations ?? []).filter((r) => r.characterId === c.id).map((r) => ({ from: o, nature: r.nature })))
    .filter((r) => !(c.relations ?? []).some((x) => x.characterId === r.from.id));
  const sources = c.sources?.length ? c.sources : [{ label: "Wikipédia (EN) — recherche", url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(`${c.name} Marvel`)}` }];

  return (
    <div className="mx-auto max-w-6xl">
      <TrackView kind="personnage" id={c.id} title={c.name} href={`/personnages/${c.id}`} />
      <nav className="mb-4 text-xs text-steel-400"><Link href="/personnages" className="hover:text-white">Personnages</Link><span className="mx-1.5">/</span><span className="text-steel-200">{c.name}</span></nav>

      <header className="panel hud-corners hud-grid relative overflow-hidden p-5 md:p-8">
        <div className="pointer-events-none absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-hq-red/15 blur-3xl" />
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="chip chip-active">{CHARACTER_KIND_LABELS[c.kind]}</span>
          {c.continuities.map((u) => <span key={u} className="chip" title={CONTINUITY_LABELS[u].description}>{CONTINUITY_LABELS[u].short}</span>)}
        </div>
        <h1 className="display text-4xl leading-none text-white md:text-6xl">{c.name}</h1>
        {c.civilName && <p className="mt-2 text-steel-300">Identité civile : <span className="text-white">{c.civilName}</span></p>}
        {c.aliases?.length ? <p className="mt-1 text-sm text-steel-400">Alias : {c.aliases.join(", ")}</p> : null}
        {c.description && <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-steel-200">{c.description}</p>}
        <div className="mt-5"><FollowCharacterButton id={c.id} /></div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {c.portrayals?.length ? (
            <section>
              <SectionTitle title="Interprètes" />
              <ul className="grid gap-2 sm:grid-cols-2">
                {c.portrayals.map((p, i) => (
                  <li key={i} className="panel p-3">
                    <Link href={`/equipes/${personSlug(p.person)}`} className="text-sm font-semibold text-white hover:underline">{p.person}</Link>
                    <p className="text-xs text-steel-400">{CONTINUITY_LABELS[p.continuity].label}{p.note ? ` — ${p.note}` : ""}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {productions.length > 0 && (
            <section>
              <SectionTitle title={`Productions associées (${productions.length})`} />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{productions.map((p) => <ProductionCard key={p.id} p={p} posterUrl={posterUrl(media[p.id])} />)}</div>
            </section>
          )}

          {members.length > 0 && (
            <section>
              <SectionTitle title="Membres et personnages affiliés" />
              <div className="flex flex-wrap gap-1.5">{members.map((m) => <Link key={m.id} href={`/personnages/${m.id}`} className="chip hover:border-white/30">{m.name}</Link>)}</div>
            </section>
          )}

          <section>
            <SectionTitle title="Actualités" href={`/actualites?personnage=${c.id}`} />
            {news.items.length ? <div className="space-y-2">{news.items.slice(0, 6).map((a) => <ArticleCard key={a.id} a={a} compact clusterSize={news.sizes[a.clusterId]} />)}</div> : <p className="text-sm text-steel-500">Aucun article récent ne mentionne ce personnage.</p>}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="panel space-y-4 p-4">
            {c.firstAppearance && (
              <div>
                <p className="eyebrow mb-1.5">Première apparition</p>
                {c.firstAppearance.comic && <p className="text-sm text-white">{c.firstAppearance.comic}{c.firstAppearance.year ? ` (${c.firstAppearance.year})` : ""}</p>}
                {c.firstAppearance.mcuProductionId && (
                  <p className="text-xs text-steel-400">Dans le MCU : <Link className="text-steel-200 hover:underline" href={`/productions/${c.firstAppearance.mcuProductionId}`}>{productions.find((p) => p.id === c.firstAppearance!.mcuProductionId)?.title ?? c.firstAppearance.mcuProductionId}</Link></p>
                )}
              </div>
            )}
            {c.abilities?.length ? (
              <div>
                <p className="eyebrow mb-1.5">Capacités</p>
                <ul className="list-inside list-disc space-y-0.5 text-sm text-steel-200">{c.abilities.map((a) => <li key={a}>{a}</li>)}</ul>
              </div>
            ) : null}
            <CharLinks label="Affiliations" ids={c.affiliations} />
            <CharLinks label="Alliés" ids={c.allies} />
            <CharLinks label="Adversaires" ids={c.enemies} />
            {(c.relations?.length || reverseRelations.length) ? (
              <div>
                <p className="eyebrow mb-1.5">Relations</p>
                <ul className="space-y-1 text-sm">
                  {(c.relations ?? []).map((r) => {
                    const o = characterById.get(r.characterId);
                    return o ? <li key={r.characterId}><Link href={`/personnages/${o.id}`} className="text-white hover:underline">{o.name}</Link> <span className="text-xs text-steel-400">— {r.nature}</span></li> : null;
                  })}
                  {reverseRelations.map((r) => <li key={r.from.id}><Link href={`/personnages/${r.from.id}`} className="text-white hover:underline">{r.from.name}</Link> <span className="text-xs text-steel-400">— relation : {r.nature.toLowerCase()} (point de vue de {r.from.name})</span></li>)}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="panel p-4"><SourceList sources={sources} /></div>
        </aside>
      </div>
    </div>
  );
}
