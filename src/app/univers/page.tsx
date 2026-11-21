import type { Metadata } from "next";
import { Suspense } from "react";
import { PRODUCTIONS, byRelease } from "@/lib/catalog";
import { CONTINUITY_LABELS } from "@/lib/labels";
import { listProductionMedia } from "@/lib/db/repo";
import { posterUrl } from "@/lib/media";
import type { ContinuityId } from "@/lib/types";
import { ProductionCard } from "@/components/ProductionCard";
import { FilterLink, PageHeader } from "@/components/ui";
import { PersistFilters } from "@/components/PersistFilters";

export const metadata: Metadata = { title: "Univers Marvel étendu" };
export const dynamic = "force-dynamic";

const ORDER: ContinuityId[] = ["marvel-television", "fox-xmen", "fox-ff", "sony-spider-man", "sony-ssu", "spider-verse", "legacy-film", "animation", "games", "comics"];

export default async function UniversPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const selected = ORDER.includes(sp.continuite as ContinuityId) ? (sp.continuite as ContinuityId) : undefined;
  const media = await listProductionMedia();
  const shown = selected ? [selected] : ORDER;

  return (
    <div className="mx-auto max-w-7xl">
      <Suspense><PersistFilters pageKey="univers" /></Suspense>
      <PageHeader
        eyebrow="Au-delà du MCU"
        title="Univers Marvel étendu"
        intro={<>Adaptations Fox et Sony, anciens films, séries Marvel Television, animation, jeux vidéo et comics. <strong>Chaque franchise est une continuité distincte</strong> : une production n'est rattachée à une autre que si un lien a été montré à l'écran ou confirmé officiellement (voir le <a href="/multivers" className="underline">multivers</a>).</>}
      />
      <div className="no-scrollbar panel mb-8 flex gap-1.5 overflow-x-auto p-3">
        <FilterLink href="/univers?continuite=toutes" active={!selected}>Toutes les franchises</FilterLink>
        {ORDER.map((c) => <FilterLink key={c} href={`/univers?continuite=${c}`} active={selected === c}>{CONTINUITY_LABELS[c].short}</FilterLink>)}
      </div>
      <div className="space-y-12">
        {shown.map((c) => {
          const items = PRODUCTIONS.filter((p) => p.continuity === c).sort(byRelease);
          if (!items.length) return null;
          return (
            <section key={c} id={c}>
              <h2 className="display text-xl text-white md:text-2xl">{CONTINUITY_LABELS[c].label}</h2>
              <p className="mt-1 mb-4 max-w-3xl text-sm text-steel-400">{CONTINUITY_LABELS[c].description}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {items.map((p) => <ProductionCard key={p.id} p={p} posterUrl={posterUrl(media[p.id])} />)}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
