"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { readLibrary, useLibrary } from "@/lib/library";

/**
 * Filtres persistants : la dernière combinaison de filtres d'une page est mémorisée
 * localement et restaurée lorsqu'on y revient sans paramètres.
 */
export function PersistFilters({ pageKey }: { pageKey: string }) {
  const params = useSearchParams();
  const path = usePathname();
  const router = useRouter();
  const { update } = useLibrary();
  const restored = useRef(false);

  useEffect(() => {
    const current = Object.fromEntries([...params.entries()].filter(([k]) => k !== "page"));
    if (!restored.current) {
      restored.current = true;
      const saved = readLibrary().filters[pageKey];
      if (!Object.keys(current).length && saved && Object.keys(saved).length) {
        router.replace(`${path}?${new URLSearchParams(saved)}`, { scroll: false });
        return;
      }
    }
    const same = JSON.stringify(current) === JSON.stringify(readLibrary().filters[pageKey] ?? {});
    if (!same) update((s) => ({ ...s, filters: { ...s.filters, [pageKey]: current } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return null;
}
