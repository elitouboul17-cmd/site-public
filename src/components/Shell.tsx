"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, X, EyeOff, Eye } from "lucide-react";
import { NAV, MOBILE_NAV } from "./nav";
import { NavIcon } from "./Icon";
import { Logo } from "./Logo";
import { SearchPalette } from "./SearchPalette";
import { useLibrary } from "@/lib/library";

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const { state, update } = useLibrary();
  const spoilerFree = state.prefs.spoilerFree;

  useEffect(() => setDrawer(false), [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !(e.target as HTMLElement)?.closest("input,textarea,select"))) {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.spoilerFree = spoilerFree ? "1" : "0";
  }, [spoilerFree]);

  const toggleSpoilers = () => update((s) => ({ ...s, prefs: { ...s.prefs, spoilerFree: !s.prefs.spoilerFree } }));

  const navList = (
    <nav aria-label="Navigation principale" className="flex flex-col gap-0.5">
      {NAV.map((n) => {
        const active = isActive(path, n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-hq-red/15 text-white" : "text-steel-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className={`h-5 w-0.5 rounded-full ${active ? "bg-hq-red" : "bg-transparent"}`} aria-hidden />
            <NavIcon name={n.icon} className={`h-4.5 w-4.5 ${active ? "text-hq-red" : "text-steel-400 group-hover:text-steel-200"}`} />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-dvh">
      {/* Barre latérale (desktop) */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-white/5 bg-ink-900/80 backdrop-blur lg:flex">
        <div className="px-5 pt-5 pb-4">
          <Link href="/" aria-label="Le QG des Héros — accueil">
            <Logo />
          </Link>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4">{navList}</div>
        <div className="space-y-2 border-t border-white/5 p-4 text-[11px] leading-relaxed text-steel-500">
          <Link href="/sources" className="block hover:text-steel-200">Sources et fiabilité</Link>
          <p>Portail de fan indépendant, non affilié à Marvel ni à Disney.</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barre supérieure */}
        <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/80 backdrop-blur-md pt-[env(safe-area-inset-top)]">
          <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:px-8">
            <button className="btn h-10 w-10 shrink-0 p-0 lg:hidden" aria-label="Ouvrir le menu" onClick={() => setDrawer(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="shrink-0 lg:hidden" aria-label="Accueil">
              <Logo compact />
            </Link>
            <button
              onClick={() => setSearch(true)}
              className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-left text-sm text-steel-400 transition hover:border-white/20 md:max-w-md"
              aria-label="Rechercher dans le QG des Héros"
            >
              <Search className="h-4 w-4" />
              <span className="truncate"><span className="sm:hidden">Rechercher…</span><span className="hidden sm:inline">Rechercher un film, un personnage, un article…</span></span>
              <kbd className="ml-auto hidden rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-steel-500 md:inline">Ctrl K</kbd>
            </button>
            <button
              onClick={toggleSpoilers}
              className={`btn h-10 w-10 shrink-0 p-0 sm:w-auto sm:px-3 ${spoilerFree ? "border-hq-red/60 bg-hq-red/15" : ""}`}
              aria-pressed={spoilerFree}
              title="Mode sans spoilers : masque les détails des productions non vues"
            >
              {spoilerFree ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="hidden sm:inline">{spoilerFree ? "Sans spoilers" : "Spoilers visibles"}</span>
            </button>
          </div>
        </header>

        <main id="contenu" className="flex-1 px-4 pt-6 pb-28 md:px-6 lg:px-8 lg:pb-12">{children}</main>
      </div>

      {/* Navigation mobile inférieure */}
      <nav aria-label="Navigation rapide" className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {NAV.filter((n) => MOBILE_NAV.includes(n.href)).map((n) => {
            const active = isActive(path, n.href);
            return (
              <Link key={n.href} href={n.href} className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold ${active ? "text-white" : "text-steel-400"}`}>
                <NavIcon name={n.icon} className={`h-5 w-5 ${active ? "text-hq-red" : ""}`} />
                {n.label.replace("Univers ", "").replace("Ma bibliothèque", "Biblio")}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Tiroir mobile */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-black/70" aria-label="Fermer le menu" onClick={() => setDrawer(false)} />
          <div className="animate-fade-up absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col border-r border-white/10 bg-ink-900 pt-[env(safe-area-inset-top)]">
            <div className="flex items-center justify-between px-5 py-4">
              <Logo />
              <button className="btn h-10 w-10 p-0" aria-label="Fermer" onClick={() => setDrawer(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-6">{navList}</div>
            <div className="border-t border-white/5 p-4 text-xs text-steel-500">
              <Link href="/sources" className="hover:text-white">Sources et fiabilité</Link>
            </div>
          </div>
        </div>
      )}

      <SearchPalette open={search} onClose={() => setSearch(false)} />
    </div>
  );
}
