import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CHARACTERS, productionsForCharacter } from "@/lib/catalog";
import { CHARACTER_KIND_LABELS, CONTINUITY_LABELS } from "@/lib/labels";
import type { CharacterKind, ContinuityId } from "@/lib/types";
import { FilterLink, PageHeader, EmptyState } from "@/components/ui";
import { PersistFilters } from "@/components/PersistFilters";

export const metadata: Metadata = { title: "Personnages" };
export const dynamic = "force-dynamic";

const KINDS: (CharacterKind | "tous")[] = ["tous", "heros", "vilain", "anti-heros", "secondaire", "equipe", "organisation"];
const UNIVERSES: (ContinuityId | "tous")[] = ["tous", "mcu", "marvel-television", "fox-xmen", "sony-spider-man", "sony-ssu", "spider-verse", "comics"];

function initials(name: string) {
  return name.replace(/^(Le |La |Les |L')/, "").split(/[\s-]+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default async function CharactersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const kind = KINDS.includes(sp.type as CharacterKind) ? sp.type! : "tous";
  const uni = UNIVERSES.includes(sp.univers as ContinuityId) ? sp.univers! : "tous";
  const list = CHARACTERS.filter((c) => (kind === "tous" || c.kind === kind) && (uni === "tous" || c.continuities.includes(uni as ContinuityId)))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const href = (patch: Record<string, string>) => `/personnages?${new URLSearchParams({ type: kind, univers: uni, ...patch })}`;

  return (
    <div className="mx-auto max-w-7xl">
      <Suspense><PersistFilters pageKey="personnages" /></Suspense>
      <PageHeader eyebrow="Encyclopédie" title="Personnages" intro="Héros, vilains, personnages secondaires, équipes et organisations. Les interprètes sont indiqués par continuité : un même personnage peut exister dans plusieurs franchises indépendantes." />
      <div className="panel mb-6 space-y-3 p-3">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">{KINDS.map((k) => <FilterLink key={k} href={href({ type: k })} active={kind === k}>{k === "tous" ? "Tous" : CHARACTER_KIND_LABELS[k as CharacterKind]}</FilterLink>)}</div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">{UNIVERSES.map((u) => <FilterLink key={u} href={href({ univers: u })} active={uni === u}>{u === "tous" ? "Tous les univers" : CONTINUITY_LABELS[u as ContinuityId].short}</FilterLink>)}</div>
      </div>
      {list.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((c) => {
            const n = productionsForCharacter(c).length;
            return (
              <Link key={c.id} href={`/personnages/${c.id}`} className="panel panel-hover flex items-center gap-3 p-3">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${c.kind === "vilain" ? "border-hq-red/40 bg-hq-red/10 text-hq-red" : c.kind === "equipe" || c.kind === "organisation" ? "border-arc/30 bg-arc/10 text-arc" : "border-white/10 bg-white/5 text-white"}`} aria-hidden>
                  {initials(c.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-white">{c.name}</span>
                  <span className="block truncate text-xs text-steel-400">{c.civilName ?? CHARACTER_KIND_LABELS[c.kind]}</span>
                  <span className="block text-[11px] text-steel-500">{CHARACTER_KIND_LABELS[c.kind]} · {n} production{n > 1 ? "s" : ""}</span>
                </span>
              </Link>
            );
          })}
        </div>
      ) : <EmptyState title="Aucun personnage pour ces filtres" />}
      <p className="mt-4 text-xs text-steel-500">{list.length} fiche(s). Aucune image de personnage n'est reproduite (droits réservés) : les vignettes sont typographiques.</p>
    </div>
  );
}
