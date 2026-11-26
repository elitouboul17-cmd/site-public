import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PEOPLE, productionById, BEHIND_THE_SCENES, CHARACTERS } from "@/lib/catalog";
import { ROLE_LABELS, CONTINUITY_LABELS } from "@/lib/labels";
import type { PersonRole } from "@/lib/types";
import { PageHeader, SectionTitle } from "@/components/ui";
import { TrackView } from "@/components/LibraryControls";
import { PersonAvatar, PhotoCredit } from "@/components/PersonAvatar";
import { photoFor } from "@/lib/photos";

type Params = Promise<{ id: string }>;
export function generateStaticParams() {
  return [...PEOPLE.keys()].map((id) => ({ id }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: PEOPLE.get((await params).id)?.name ?? "Personne introuvable" };
}

export default async function PersonPage({ params }: { params: Params }) {
  const p = PEOPLE.get((await params).id);
  if (!p) notFound();
  const byRole = new Map<PersonRole, typeof p.credits>();
  for (const c of p.credits) byRole.set(c.role, [...(byRole.get(c.role) ?? []), c]);
  const bts = BEHIND_THE_SCENES.filter((b) => b.personIds?.includes(p.name));
  const portrayals = CHARACTERS.flatMap((c) => (c.portrayals ?? []).filter((x) => x.person === p.name).map((x) => ({ c, x })));
  const wiki = `https://fr.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(p.name)}`;

  return (
    <div className="mx-auto max-w-4xl">
      <TrackView kind="personne" id={p.id} title={p.name} href={`/equipes/${p.id}`} />
      <nav className="mb-4 text-xs text-steel-400"><Link href="/equipes" className="hover:text-white">Casting et équipes</Link></nav>
      <div className="mb-8 flex flex-col items-start gap-5 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <PersonAvatar id={p.id} name={p.name} size={128} className="text-2xl" />
          <div className="max-w-[160px]"><PhotoCredit id={p.id} /></div>
        </div>
        <PageHeader eyebrow={p.roles.map((r) => ROLE_LABELS[r]).join(" · ")} title={p.name}>
          <a href={photoFor(p.id)?.wikipedia ?? wiki} target="_blank" rel="noopener noreferrer" className="text-xs text-steel-400 underline hover:text-white">{photoFor(p.id) ? "Wikipédia" : "Rechercher sur Wikipédia"}</a>
        </PageHeader>
      </div>

      {portrayals.length > 0 && (
        <section className="mb-8">
          <SectionTitle title="Personnages interprétés" />
          <div className="flex flex-wrap gap-1.5">{portrayals.map(({ c, x }, i) => <Link key={i} href={`/personnages/${c.id}`} className="chip hover:border-white/30">{c.name} <span className="text-steel-500">· {CONTINUITY_LABELS[x.continuity].short}</span></Link>)}</div>
        </section>
      )}

      <div className="space-y-8">
        {[...byRole].map(([role, credits]) => (
          <section key={role}>
            <SectionTitle title={ROLE_LABELS[role]} />
            <ul className="panel divide-y divide-white/5">
              {credits.map((c, i) => {
                const prod = productionById.get(c.productionId)!;
                return (
                  <li key={i} className="flex flex-wrap items-baseline gap-x-3 p-3">
                    <span className="w-12 shrink-0 text-xs text-steel-500">{prod.releaseDate?.slice(0, 4) ?? "—"}</span>
                    <Link href={`/productions/${prod.id}`} className="text-sm font-semibold text-white hover:underline">{prod.title}</Link>
                    {c.detail && <span className="text-xs text-steel-400">{c.detail}</span>}
                    <span className="ml-auto text-[11px] text-steel-500">{CONTINUITY_LABELS[prod.continuity].short}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {bts.length > 0 && (
          <section>
            <SectionTitle title="Dans les coulisses" />
            <ul className="space-y-2">{bts.map((b) => <li key={b.id} className="panel p-3"><Link href={`/coulisses#${b.id}`} className="text-sm font-semibold text-white hover:underline">{b.title}</Link><p className="mt-1 text-xs text-steel-300">{b.summary}</p></li>)}</ul>
          </section>
        )}
      </div>
      <p className="mt-8 text-xs text-steel-500">Crédits issus des fiches de productions de MARVEL HQ (chacune liée à ses sources). Liste non exhaustive.</p>
    </div>
  );
}
