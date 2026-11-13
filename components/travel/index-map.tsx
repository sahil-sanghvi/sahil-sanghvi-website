"use client";

import { useCallback } from "react";
import { TravelMap, type MapStop } from "./travel-map";

/** The /travel map: clicking a pin scrolls to that place's section below. */
export function IndexMap({ stops }: { stops: MapStop[] }) {
  const onSelect = useCallback((slug: string) => {
    const section = document.getElementById(slug);
    if (!section) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${slug}`);
  }, []);

  return <TravelMap stops={stops} onSelect={onSelect} className="h-[56vh] min-h-[320px] w-full" />;
}
