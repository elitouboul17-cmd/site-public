import type { Metadata } from "next";
import { Suspense } from "react";
import { PRODUCTIONS, byNarrative, byRelease } from "@/lib/catalog";
import { listProductionMedia } from "@/lib/db/repo";
import { posterUrl } from "@/lib/media";
import { ProductionCard } from "@/components/ProductionCard";
import { FilterLink, PageHeader, EmptyState } from "@/components/ui";
import { PersistFilters } from "@/components/PersistFilters";
import type { Production } from "@/lib/types";

export const metadata: Metadata = { title: "Univers MCU" };
export const dynamic = "force-dynamic";

const TYPES = [
  { id: "tous", label: "Tout" },
  { id: "film", label: "Films" },
  { id: "serie", label: "Séries" },
  { id: "animation", label: "Animation" },
  { id: "court-metrage", label: "Courts-métrages" },
  { id: "presentation-speciale", label: "Présentations spéciales" },
  { id: "marvel-television", label: "Marvel Television" },
] as const;

const SORTS = [
  { id: "sortie", label: "Ordre de sortie" },
  { id: "chronologie", label: "Ordre chronologique (narratif)" },
  { id: "phase", label: "Par phase" },
] as const;

type SP = Promise<Record<string, string | undefined>>;

function matchesType(p: Production, t: string) {
  if (t === "tous") return p.continuity === "mcu";
  if (t === "marvel-television") return p.continuity === "marvel-television";
  if (t === "animation") return p.continuity === "mcu" && (p.kind === "serie-animee" || p.kind === "film-anime");
  return p.continuity === "mcu" && p.kind === t;
}

export default async function McuPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const type = TYPES.some((t) => t.id === sp.type) ? sp.type! : "tous";
  const sort = SORTS.some((s) => s.id === sp.tri) ? sp.tri! : "sortie";
  const phase = sp.phase && /^[1-6]$/.test(sp.phase) ? Number(sp.phase) : undefined;
  const media = await listProductionMedia();

  let list = PRODUCTIONS.filter((p) => matchesType(p, type) && (!phase || p.phase === phase));
  list = [...list].sort(sort === "chronologie" ? byNarrative : byRelease);
  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams(Object.entries({ type, tri: sort, phase: phase ? String(phase) : undefined, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/mcu?${q}`;
  };

  const grid = (items: Production[], showOrder = false) => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((p, i) => <ProductionCard key={p.id} p={p} posterUrl={posterUrl(media[p.id])} showOrder={showOrder && p.narrativeOrder ? i + 1 : undefined} />)}
    </div>
  );

  const phases = [1, 2, 3, 4, 5, 6];
  return (
    <div className="mx-auto max-w-7xl">
      <Suspense><PersistFilters pageKey="mcu" /></Suspense>
      <PageHeader
        eyebrow="Marvel Cinematic Universe"
        title="Univers MCU"
        intro={<>Toutes les productions Marvel Studios du MCU, de <em>Iron Man</em> (2008) aux films annoncés. L'<strong>ordre de sortie</strong> et l'<strong>ordre chronologique</strong> de l'histoire sont deux classements distincts.</>}
      />

      <div className="panel mb-6 space-y-3 p-3 md:p-4">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">{TYPES.map((t) => <FilterLink key={t.id} href={href({ type: t.id })} active={type === t.id}>{t.label}</FilterLink>)}</div>
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">{SORTS.map((s) => <FilterLink key={s.id} href={href({ tri: s.id })} active={sort === s.id}>{s.label}</FilterLink>)}</div>
        {type !== "marvel-television" && (
          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
            <FilterLink href={href({ phase: undefined })} active={!phase}>Toutes les phases</FilterLink>
            {phases.map((n) => <FilterLink key={n} href={href({ phase: String(n) })} active={phase === n}>Phase {n}</FilterLink>)}
          </div>
        )}
      </div>

      {sort === "chronologie" && (
        <p className="mb-4 rounded-lg border border-rumeur/30 bg-rumeur/5 p-3 text-xs leading-relaxed text-steel-300">
          Ordre narratif : les numéros suivent la chronologie officielle de Marvel Studios pour la Saga de l'Infini. Pour les productions postérieures à <em>Endgame</em>, l'ordre interne n'est pas fixé officiellement : elles sont rangées par date de sortie. Certaines datations restent discutées (voir la <a className="underline" href="/chronologie">chronologie</a>).
        </p>
      )}
      {type === "marvel-television" && (
        <p className="mb-4 rounded-lg border border-reporte/30 bg-reporte/5 p-3 text-xs leading-relaxed text-steel-300">
          Les séries Marvel Television (ABC, Netflix, Hulu, Freeform) font référence au MCU, mais leur appartenance à sa continuité n'a jamais été pleinement confirmée par Marvel Studios. Elles sont présentées séparément.
        </p>
      )}

      {!list.length ? (
        <EmptyState title="Aucune production pour ces filtres" />
      ) : sort === "phase" ? (
        <div className="space-y-8">
          {[...phases, 0].map((n) => {
            const items = list.filter((p) => (p.phase ?? 0) === n);
            if (!items.length) return null;
            return (
              <section key={n}>
                <h2 className="display mb-3 text-lg text-white">{n ? `Phase ${n}` : "Hors phase / non attribuée"} <span className="text-sm text-steel-500">· {items.length}</span></h2>
                {grid(items)}
              </section>
            );
          })}
        </div>
      ) : (
        grid(list, sort === "chronologie")
      )}
      <p className="mt-6 text-xs text-steel-500">{list.length} production(s). Dates : sortie initiale aux États-Unis.</p>
    </div>
  );
}
