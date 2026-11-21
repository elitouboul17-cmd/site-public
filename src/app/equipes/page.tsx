import type { Metadata } from "next";
import Link from "next/link";
import { PEOPLE } from "@/lib/catalog";
import { ROLE_LABELS } from "@/lib/labels";
import type { PersonRole } from "@/lib/types";
import { FilterLink, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Casting et équipes" };
export const dynamic = "force-dynamic";

const ROLES: PersonRole[] = ["acteur", "realisateur", "scenariste", "producteur", "compositeur", "superviseur-vfx", "monteur", "directeur-photo", "costumier", "chef-decorateur"];

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ role?: string; lettre?: string }> }) {
  const sp = await searchParams;
  const role = ROLES.includes(sp.role as PersonRole) ? (sp.role as PersonRole) : undefined;
  const all = [...PEOPLE.values()];
  const list = all
    .filter((p) => !role || p.roles.includes(role))
    .map((p) => ({ ...p, n: new Set(p.credits.map((c) => c.productionId)).size }))
    .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, "fr"));
  const counts = new Map<PersonRole, number>();
  for (const p of all) for (const r of p.roles) counts.set(r, (counts.get(r) ?? 0) + 1);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Professionnels" title="Casting et équipes" intro="Acteurs, réalisateurs, scénaristes, compositeurs, monteurs, chefs opérateurs… Chaque fiche liste les crédits enregistrés dans MARVEL HQ (non exhaustifs : uniquement des crédits vérifiables, sur les productions référencées)." />
      <div className="no-scrollbar panel mb-6 flex gap-1.5 overflow-x-auto p-3">
        <FilterLink href="/equipes" active={!role}>Tous ({all.length})</FilterLink>
        {ROLES.filter((r) => counts.get(r)).map((r) => <FilterLink key={r} href={`/equipes?role=${r}`} active={role === r}>{ROLE_LABELS[r]} ({counts.get(r)})</FilterLink>)}
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <li key={p.id}>
            <Link href={`/equipes/${p.id}`} className="panel panel-hover flex items-center justify-between gap-3 p-3">
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{p.name}</span>
                <span className="block truncate text-xs text-steel-400">{p.roles.map((r) => ROLE_LABELS[r]).join(" · ")}</span>
              </span>
              <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-xs font-bold text-steel-200" title="Productions référencées">{p.n}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
