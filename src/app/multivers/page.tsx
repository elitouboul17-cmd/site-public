import type { Metadata } from "next";
import Link from "next/link";
import { UNIVERSES, productionById } from "@/lib/catalog";
import { CONTINUITY_LABELS } from "@/lib/labels";
import { PageHeader, SourceList } from "@/components/ui";
import { SpoilerGuard } from "@/components/LibraryControls";

export const metadata: Metadata = { title: "Multivers" };

export default function MultiversePage() {
  const byId = new Map(UNIVERSES.map((u) => [u.id, u]));
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Multivers"
        title="Univers, variantes et connexions"
        intro={<>Seules figurent ici les <strong>connexions montrées à l'écran ou confirmées officiellement</strong>. L'existence d'un personnage dans deux franchises ne suffit pas à relier leurs univers. Les désignations (« Terre-616 »…) ne sont indiquées que lorsqu'elles ont été données à l'écran ou par Marvel.</>}
      />

      <section className="panel mb-8 p-4 md:p-6">
        <h2 className="display mb-4 text-lg text-white">Carte des connexions confirmées</h2>
        <SpoilerGuard force label="Connexions masquées (mode sans spoilers)">
          <ul className="space-y-2">
            {UNIVERSES.flatMap((u) => (u.confirmedLinks ?? []).map((l) => ({ from: u, to: byId.get(l.universeId)!, link: l }))).map(({ from, to, link }) => (
              <li key={`${from.id}-${to.id}`} className="flex flex-wrap items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm">
                <a href={`#${from.id}`} className="chip chip-active">{from.designation} · {from.name}</a>
                <span className="text-hq-red" aria-hidden>⟷</span>
                <a href={`#${to.id}`} className="chip">{to.designation !== "Non précisée à l'écran" ? `${to.designation} · ` : ""}{to.name}</a>
                <span className="text-xs text-steel-400">{link.via} — <Link className="underline hover:text-white" href={`/productions/${link.productionId}`}>{productionById.get(link.productionId)?.title}</Link></span>
              </li>
            ))}
          </ul>
        </SpoilerGuard>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {UNIVERSES.map((u) => (
          <article key={u.id} id={u.id} className="panel scroll-mt-24 p-4">
            <p className="eyebrow text-hq-red">{u.designation}</p>
            <h2 className="mt-1 text-lg font-semibold text-white">{u.name}</h2>
            <p className="mt-0.5 text-xs text-steel-500">{CONTINUITY_LABELS[u.continuity].label}</p>
            <p className="mt-3 text-sm leading-relaxed text-steel-300">{u.description}</p>
            {u.notes && <p className="mt-2 text-xs text-rumeur">{u.notes}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {u.productionIds.map((id) => <Link key={id} href={`/productions/${id}`} className="chip hover:border-white/30">{productionById.get(id)?.title ?? id}</Link>)}
            </div>
            <div className="mt-3 border-t border-white/5 pt-3"><SourceList sources={u.sources} /></div>
          </article>
        ))}
      </div>
    </div>
  );
}
