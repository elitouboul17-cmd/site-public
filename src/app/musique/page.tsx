import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTIONS, byRelease, personSlug, productionById } from "@/lib/catalog";
import { CONTINUITY_LABELS } from "@/lib/labels";
import { FEATURED_TRACKS } from "@/data/music";
import { soundtrackQuery } from "@/lib/music";
import { themeFor } from "@/lib/theme";
import { ListenButtons } from "@/components/MusicLinks";
import { FilterLink, PageHeader, SectionTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Bandes originales" };
export const dynamic = "force-dynamic";

export default async function MusicPage({ searchParams }: { searchParams: Promise<{ vue?: string; univers?: string }> }) {
  const sp = await searchParams;
  const view = sp.vue === "films" ? "films" : sp.vue === "chansons" ? "chansons" : "compositeurs";
  const onlyMcu = sp.univers !== "tous";
  const withMusic = PRODUCTIONS.filter((p) => p.composers?.length && p.kind !== "comic" && (!onlyMcu || p.continuity === "mcu")).sort(byRelease);

  const byComposer = new Map<string, typeof withMusic>();
  for (const p of withMusic) for (const c of p.composers!) byComposer.set(c, [...(byComposer.get(c) ?? []), p]);
  const composers = [...byComposer].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "fr"));
  const href = (patch: Record<string, string>) => `/musique?${new URLSearchParams({ vue: view, univers: onlyMcu ? "mcu" : "tous", ...patch })}`;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Musique"
        title="Bandes originales"
        intro="Les compositeurs et les chansons des productions Marvel. Chaque bouton ouvre une recherche sur Spotify, YouTube Music, Deezer ou Apple Music : on écoute chez la plateforme, la musique reste à ses ayants droit."
      />
      <div className="panel mb-6 space-y-3 p-3">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          <FilterLink href={href({ vue: "compositeurs" })} active={view === "compositeurs"}>Par compositeur</FilterLink>
          <FilterLink href={href({ vue: "films" })} active={view === "films"}>Par film et série</FilterLink>
          <FilterLink href={href({ vue: "chansons" })} active={view === "chansons"}>Chansons emblématiques</FilterLink>
        </div>
        {view !== "chansons" && (
          <div className="flex gap-1.5">
            <FilterLink href={href({ univers: "mcu" })} active={onlyMcu}>MCU</FilterLink>
            <FilterLink href={href({ univers: "tous" })} active={!onlyMcu}>Tout l'univers Marvel</FilterLink>
          </div>
        )}
      </div>

      {view === "compositeurs" && (
        <div className="grid gap-4 md:grid-cols-2">
          {composers.map(([name, prods]) => (
            <section key={name} className="panel p-4">
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <Link href={`/equipes/${personSlug(name)}`} className="text-lg font-semibold text-white hover:underline">{name}</Link>
                <span className="text-xs text-steel-400">{prods.length} BO</span>
              </div>
              <ul className="space-y-2">
                {prods.map((p) => (
                  <li key={p.id} className="flex flex-col gap-1.5 border-t border-white/5 pt-2">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: `linear-gradient(135deg, ${themeFor(p).colors[0]}, ${themeFor(p).colors[1]})` }} aria-hidden />
                      <Link href={`/productions/${p.id}#musique`} className="text-sm text-steel-100 hover:underline">{p.title}</Link>
                      <span className="text-[11px] text-steel-500">{p.releaseDate?.slice(0, 4)}</span>
                    </span>
                    <ListenButtons compact query={soundtrackQuery({ originalTitle: p.originalTitle, composers: [name] })} label={`la bande originale de ${p.title}`} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {view === "films" && (
        <ul className="space-y-2">
          {withMusic.map((p) => (
            <li key={p.id} className="panel flex flex-col gap-2 p-3 md:flex-row md:items-center">
              <span className="h-10 w-1.5 shrink-0 rounded-full max-md:hidden" style={{ background: `linear-gradient(${themeFor(p).colors.join(", ")})` }} aria-hidden />
              <div className="min-w-0 flex-1">
                <Link href={`/productions/${p.id}#musique`} className="block truncate text-sm font-semibold text-white hover:underline">{p.title}</Link>
                <p className="truncate text-xs text-steel-400">{p.composers!.join(", ")} · {p.releaseDate?.slice(0, 4) ?? "—"} · {CONTINUITY_LABELS[p.continuity].short}</p>
              </div>
              <ListenButtons compact query={soundtrackQuery(p)} label={`la bande originale de ${p.title}`} />
            </li>
          ))}
        </ul>
      )}

      {view === "chansons" && (
        <div className="space-y-6">
          {Object.entries(FEATURED_TRACKS).map(([pid, tracks]) => {
            const p = productionById.get(pid);
            if (!p) return null;
            return (
              <section key={pid}>
                <SectionTitle title={p.title} href={`/productions/${pid}#musique`} linkLabel="Fiche" />
                <ul className="space-y-2">
                  {tracks.map((t) => (
                    <li key={t.title} className="panel flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{t.title}</p>
                        <p className="truncate text-xs text-steel-400">{t.artist} · {t.role}</p>
                      </div>
                      <ListenButtons compact query={`${t.title} ${t.artist}`} label={`${t.title} de ${t.artist}`} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
