import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTIONS } from "@/lib/catalog";
import { CONTINUITY_LABELS } from "@/lib/labels";
import { allDetails, formatUsd } from "@/lib/details";
import { themeFor } from "@/lib/theme";
import { FilterLink, PageHeader, SectionTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Box-office" };
export const dynamic = "force-dynamic";

export default async function BoxOfficePage({ searchParams }: { searchParams: Promise<{ univers?: string; tri?: string }> }) {
  const sp = await searchParams;
  const onlyMcu = sp.univers !== "tous";
  const sort = sp.tri === "rentabilite" ? "rentabilite" : sp.tri === "budget" ? "budget" : "recettes";
  const D = allDetails();
  const rows = PRODUCTIONS.filter((p) => D[p.id]?.revenue && (!onlyMcu || p.continuity === "mcu")).map((p) => ({
    p, revenue: D[p.id].revenue!, budget: D[p.id].budget, ratio: D[p.id].budget ? D[p.id].revenue! / D[p.id].budget! : undefined,
  }));
  rows.sort((a, b) => sort === "budget" ? (b.budget ?? 0) - (a.budget ?? 0) : sort === "rentabilite" ? (b.ratio ?? 0) - (a.ratio ?? 0) : b.revenue - a.revenue);
  const max = Math.max(...rows.map((r) => (sort === "budget" ? r.budget ?? 0 : sort === "rentabilite" ? r.ratio ?? 0 : r.revenue)), 1);
  const total = rows.reduce((s, r) => s + r.revenue, 0);
  const phases = [1, 2, 3, 4, 5, 6].map((n) => {
    const list = rows.filter((r) => r.p.phase === n && r.p.continuity === "mcu");
    return { n, count: list.length, revenue: list.reduce((s, r) => s + r.revenue, 0) };
  }).filter((x) => x.count);
  const href = (patch: Record<string, string>) => `/box-office?${new URLSearchParams({ univers: onlyMcu ? "mcu" : "tous", tri: sort, ...patch })}`;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Impact"
        title="Box-office"
        intro="Recettes mondiales en salles et budgets de production, en dollars US non corrigés de l'inflation. Source : TMDB (base collaborative). Les budgets sont des estimations (hors marketing) : les studios les publient rarement."
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="panel p-4"><p className="eyebrow">Recettes cumulées</p><p className="display mt-1 text-3xl text-white">{formatUsd(total)}</p><p className="text-xs text-steel-400">{rows.length} films</p></div>
        {rows[0] && sort === "recettes" && <div className="panel p-4"><p className="eyebrow">N° 1</p><p className="mt-1 text-lg font-semibold text-white">{rows[0].p.title}</p><p className="text-xs text-steel-400">{formatUsd(rows[0].revenue)}</p></div>}
        <div className="panel p-4"><p className="eyebrow">Moyenne par film</p><p className="display mt-1 text-3xl text-white">{formatUsd(rows.length ? total / rows.length : 0)}</p></div>
      </div>

      <div className="panel mb-6 space-y-2 p-3">
        <div className="flex flex-wrap gap-1.5">
          <FilterLink href={href({ univers: "mcu" })} active={onlyMcu}>MCU</FilterLink>
          <FilterLink href={href({ univers: "tous" })} active={!onlyMcu}>Tous les films Marvel</FilterLink>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterLink href={href({ tri: "recettes" })} active={sort === "recettes"}>Recettes mondiales</FilterLink>
          <FilterLink href={href({ tri: "budget" })} active={sort === "budget"}>Budget</FilterLink>
          <FilterLink href={href({ tri: "rentabilite" })} active={sort === "rentabilite"}>Rentabilité (recettes ÷ budget)</FilterLink>
        </div>
      </div>

      {onlyMcu && phases.length > 0 && (
        <section className="mb-8">
          <SectionTitle title="Recettes par phase" />
          <div className="grid gap-2 sm:grid-cols-3">
            {phases.map((ph) => (
              <Link key={ph.n} href={`/mcu?phase=${ph.n}&tri=phase`} className="panel panel-hover p-3">
                <p className="text-sm font-semibold text-white">Phase {ph.n}</p>
                <p className="display text-xl text-white">{formatUsd(ph.revenue)}</p>
                <p className="text-[11px] text-steel-400">{ph.count} films en salles</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ol className="space-y-1.5">
        {rows.map((r, i) => {
          const value = sort === "budget" ? r.budget ?? 0 : sort === "rentabilite" ? r.ratio ?? 0 : r.revenue;
          const [c1, c2] = themeFor(r.p).colors;
          return (
            <li key={r.p.id} className="panel flex items-center gap-3 p-2.5">
              <span className="display w-8 shrink-0 text-center text-base text-steel-400">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <Link href={`/productions/${r.p.id}`} className="truncate text-sm font-semibold text-white hover:underline">{r.p.title}</Link>
                  <span className="shrink-0 text-sm font-semibold text-white">{sort === "rentabilite" ? (r.ratio ? `× ${r.ratio.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}` : "—") : formatUsd(value)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5" aria-hidden>
                  <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: `linear-gradient(90deg, ${c1}, ${c2})` }} />
                </div>
                <p className="mt-0.5 text-[11px] text-steel-500">{r.p.releaseDate?.slice(0, 4)} · {CONTINUITY_LABELS[r.p.continuity].short} · budget {formatUsd(r.budget)} · recettes {formatUsd(r.revenue)}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 text-xs text-steel-500">Ce produit utilise l'API TMDB sans être approuvé ni certifié par TMDB. Les chiffres peuvent différer d'autres sources (Box Office Mojo, The Numbers) et évoluer avec les ressorties.</p>
    </div>
  );
}
