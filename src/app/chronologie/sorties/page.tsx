import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTIONS, byRelease } from "@/lib/catalog";
import { KIND_LABELS, STATUS_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/text";
import { PageHeader } from "@/components/ui";
import { ChronoTabs } from "../tabs";

export const metadata: Metadata = { title: "Chronologie des sorties du MCU" };

export default function ReleaseTimeline() {
  const list = PRODUCTIONS.filter((p) => p.continuity === "mcu").sort(byRelease);
  const today = new Date().toISOString().slice(0, 10);
  const byPhase = new Map<string, typeof list>();
  for (const p of list) {
    const key = p.phase ? `Phase ${p.phase}` : "Phase non attribuée";
    byPhase.set(key, [...(byPhase.get(key) ?? []), p]);
  }
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Chronologie" title="Les sorties du MCU" intro="Ordre de sortie officiel, par phase. Les productions annoncées sans date confirmée apparaissent en fin de phase, sans date inventée.">
        <ChronoTabs active="sorties" />
      </PageHeader>
      <div className="space-y-10">
        {[...byPhase].map(([phase, items]) => (
          <section key={phase}>
            <h2 className="display mb-3 flex items-baseline gap-2 text-xl text-white">{phase}<span className="text-sm text-steel-500">{items[0].saga}</span></h2>
            <ol className="relative space-y-2 border-l border-white/10 pl-5">
              {items.map((p) => {
                const future = !p.releaseDate || p.releaseDate > today;
                return (
                  <li key={p.id} className="relative">
                    <span className={`absolute top-4 -left-[25px] h-2.5 w-2.5 rounded-full ${future ? "border border-hq-red bg-ink-950" : "bg-hq-red"}`} aria-hidden />
                    <Link href={`/productions/${p.id}`} className="panel panel-hover flex flex-wrap items-center gap-x-4 gap-y-1 p-3">
                      <span className="w-36 shrink-0 text-xs font-semibold text-steel-300">{p.releaseDate ? formatDate(p.releaseDate) : "Date non confirmée"}</span>
                      <span className="min-w-0 flex-1 text-sm font-semibold text-white">{p.title}</span>
                      <span className="text-[11px] text-steel-400">{KIND_LABELS[p.kind]}{p.platform ? ` · ${p.platform}` : ""}</span>
                      {p.status !== "sorti" && <span className="chip border-hq-red/50 text-hq-red">{STATUS_LABELS[p.status]}</span>}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
