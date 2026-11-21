import type { Metadata } from "next";
import Link from "next/link";
import { ERAS, TIMELINE, PRODUCTIONS, productionById, byNarrative } from "@/lib/catalog";
import { PageHeader, SourceList } from "@/components/ui";
import { SpoilerGuard } from "@/components/LibraryControls";
import { ChronoTabs } from "./tabs";

export const metadata: Metadata = { title: "Chronologie narrative du MCU" };

export default function NarrativeTimeline() {
  const ordered = PRODUCTIONS.filter((p) => p.continuity === "mcu" && p.narrativeOrder).sort(byNarrative);
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Chronologie"
        title="Les événements du MCU"
        intro="L'histoire du MCU dans l'ordre où elle se déroule — à ne pas confondre avec l'ordre de sortie. Les datations contestées sont signalées ; les événements qui dévoilent l'intrigue sont masqués en mode sans spoilers."
      >
        <ChronoTabs active="narratif" />
      </PageHeader>

      <ol className="relative space-y-10 border-l border-white/10 pl-6 md:pl-8">
        {ERAS.map((era) => {
          const events = TIMELINE.filter((t) => t.eraId === era.id);
          return (
            <li key={era.id} className="relative">
              <span className="absolute top-1 -left-[31px] h-4 w-4 rounded-full border-2 border-hq-red bg-ink-950 md:-left-[39px]" aria-hidden />
              <p className="eyebrow text-hq-red">{era.period}</p>
              <h2 className="display text-xl text-white md:text-2xl">{era.label}</h2>
              <p className="mt-1 text-sm text-steel-400">{era.description}</p>
              <ul className="mt-4 space-y-3">
                {events.map((e) => {
                  const body = (
                    <>
                      <p className="text-xs font-bold text-hq-red">{e.when}</p>
                      <h3 className="text-[15px] font-semibold text-white">{e.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-steel-300">{e.description}</p>
                    </>
                  );
                  return (
                    <li key={e.id} className="panel p-4">
                      {e.spoiler ? <SpoilerGuard productionIds={e.productionIds} force>{body}</SpoilerGuard> : body}
                      {e.disputed && <p className="mt-2 rounded-md border border-rumeur/30 bg-rumeur/5 p-2 text-xs text-rumeur">Datation discutée : {e.disputed}</p>}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {e.productionIds.map((id) => {
                          const p = productionById.get(id);
                          return p ? <Link key={id} href={`/productions/${id}`} className="chip hover:border-white/30">{p.title}</Link> : null;
                        })}
                      </div>
                      <details className="mt-2 text-xs text-steel-500"><summary className="cursor-pointer hover:text-steel-300">Sources</summary><div className="mt-2"><SourceList sources={e.sources} /></div></details>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>

      <section className="mt-14">
        <h2 className="display mb-1 text-xl text-white">Ordre de visionnage chronologique — Saga de l'Infini</h2>
        <p className="mb-4 text-sm text-steel-400">Selon la chronologie officielle de Marvel Studios. Au-delà d'<em>Endgame</em>, Marvel n'a pas fixé d'ordre officiel unique.</p>
        <ol className="grid gap-2 sm:grid-cols-2">
          {ordered.map((p, i) => (
            <li key={p.id} className="panel flex items-center gap-3 p-3">
              <span className="display w-8 shrink-0 text-center text-lg text-hq-red">{i + 1}</span>
              <span className="min-w-0">
                <Link href={`/productions/${p.id}`} className="block truncate text-sm font-semibold text-white hover:underline">{p.title}</Link>
                <span className="text-xs text-steel-400">{p.narrativeEra} · sorti en {p.releaseDate?.slice(0, 4)}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
