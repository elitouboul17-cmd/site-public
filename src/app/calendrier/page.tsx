import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calendarEntries } from "@/lib/catalog";
import { CALENDAR_KIND_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/text";
import type { CalendarEntry, CalendarKind } from "@/lib/types";
import { CertaintyBadge, FilterLink, PageHeader, EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Calendrier" };
export const dynamic = "force-dynamic";

const KIND_COLORS: Record<CalendarKind, string> = {
  "sortie-film": "bg-hq-red", "sortie-serie": "bg-arc", episode: "bg-arc/60", evenement: "bg-officiel", convention: "bg-theorie", "bande-annonce": "bg-rumeur",
};
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function Entry({ e }: { e: CalendarEntry }) {
  const title = e.productionId ? <Link href={`/productions/${e.productionId}`} className="hover:underline">{e.title}</Link> : e.title;
  return (
    <li id={e.id} className="panel flex flex-wrap items-center gap-3 p-3">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${KIND_COLORS[e.kind]}`} aria-hidden />
      <span className="w-40 shrink-0 text-xs font-semibold text-steel-300">{formatDate(e.date)}{e.endDate ? ` → ${formatDate(e.endDate)}` : ""}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="block text-xs text-steel-400">{CALENDAR_KIND_LABELS[e.kind]}{e.location ? ` · ${e.location}` : ""}</span>
      </span>
      <CertaintyBadge certainty={e.certainty} date={e.date} />
    </li>
  );
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ vue?: string; mois?: string; periode?: string }> }) {
  const sp = await searchParams;
  const view = sp.vue === "mois" ? "mois" : "liste";
  const today = new Date().toISOString().slice(0, 10);
  const all = calendarEntries();

  if (view === "liste") {
    const period = sp.periode === "passe" ? "passe" : "avenir";
    const list = period === "avenir" ? all.filter((e) => (e.endDate ?? e.date) >= today) : all.filter((e) => e.date < today).reverse().slice(0, 60);
    const groups = new Map<string, CalendarEntry[]>();
    for (const e of list) groups.set(e.date.slice(0, 7), [...(groups.get(e.date.slice(0, 7)) ?? []), e]);
    return (
      <Shell view={view}>
        <div className="mb-4 flex gap-1.5">
          <FilterLink href="/calendrier?vue=liste&periode=avenir" active={period === "avenir"}>À venir</FilterLink>
          <FilterLink href="/calendrier?vue=liste&periode=passe" active={period === "passe"}>Passé récent</FilterLink>
        </div>
        {list.length ? (
          <div className="space-y-6">
            {[...groups].map(([ym, items]) => (
              <section key={ym}>
                <h2 className="display mb-2 text-base text-white">{MONTHS[Number(ym.slice(5)) - 1]} {ym.slice(0, 4)}</h2>
                <ul className="space-y-2">{items.map((e) => <Entry key={e.id} e={e} />)}</ul>
              </section>
            ))}
          </div>
        ) : <EmptyState title="Aucune date confirmée à venir">Les productions annoncées sans date ne sont pas placées dans le calendrier.</EmptyState>}
      </Shell>
    );
  }

  const ym = sp.mois && /^\d{4}-\d{2}$/.test(sp.mois) ? sp.mois : today.slice(0, 7);
  const [y, m] = ym.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7; // lundi = 0
  const inMonth = all.filter((e) => e.date.startsWith(ym) || (e.endDate && e.date <= `${ym}-31` && e.endDate >= `${ym}-01`));
  const cells = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, i) => i - offset + 1);

  return (
    <Shell view={view}>
      <div className="mb-4 flex items-center justify-between">
        <Link className="btn h-10 w-10 p-0" href={`/calendrier?vue=mois&mois=${shiftMonth(ym, -1)}`} aria-label="Mois précédent"><ChevronLeft className="h-4 w-4" /></Link>
        <h2 className="display text-xl text-white">{MONTHS[m - 1]} {y}</h2>
        <Link className="btn h-10 w-10 p-0" href={`/calendrier?vue=mois&mois=${shiftMonth(ym, 1)}`} aria-label="Mois suivant"><ChevronRight className="h-4 w-4" /></Link>
      </div>
      <div className="panel overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/5 text-center text-[11px] font-semibold text-steel-400">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => <div key={d} className="py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            const date = d >= 1 && d <= daysInMonth ? `${ym}-${String(d).padStart(2, "0")}` : null;
            const evs = date ? inMonth.filter((e) => e.date === date || (e.endDate && e.date <= date && e.endDate >= date)) : [];
            return (
              <div key={i} className={`min-h-16 border-r border-b border-white/5 p-1 md:min-h-24 md:p-1.5 ${!date ? "bg-black/20" : ""} ${date === today ? "bg-hq-red/10" : ""}`}>
                {date && <p className={`text-[11px] ${date === today ? "font-bold text-hq-red" : "text-steel-500"}`}>{d}</p>}
                <ul className="mt-0.5 space-y-0.5">
                  {evs.map((e) => (
                    <li key={e.id} className="truncate text-[10px] leading-tight md:text-[11px]">
                      <a href={`#${e.id}`} className="flex items-center gap-1 text-steel-100 hover:text-white" title={e.title}>
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${KIND_COLORS[e.kind]}`} />
                        <span className="truncate">{e.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
      {inMonth.length > 0 && <ul className="mt-6 space-y-2">{inMonth.map((e) => <Entry key={e.id} e={e} />)}</ul>}
    </Shell>
  );
}

function Shell({ view, children }: { view: "liste" | "mois"; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Agenda" title="Calendrier" intro="Sorties de films et séries, conventions et événements. Seules les dates officielles ou constatées sont affichées ; une date estimée serait explicitement marquée « Estimée ». Les productions annoncées sans date n'y figurent pas.">
        <div className="flex flex-wrap gap-1.5">
          <FilterLink href="/calendrier?vue=liste" active={view === "liste"}>Liste chronologique</FilterLink>
          <FilterLink href="/calendrier?vue=mois" active={view === "mois"}>Vue calendrier</FilterLink>
        </div>
      </PageHeader>
      <div className="mb-4 flex flex-wrap gap-3 text-[11px] text-steel-400">
        {(Object.keys(KIND_COLORS) as CalendarKind[]).map((k) => <span key={k} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${KIND_COLORS[k]}`} />{CALENDAR_KIND_LABELS[k]}</span>)}
      </div>
      {children}
    </div>
  );
}
