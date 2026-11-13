"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export interface MapStop {
  slug: string;
  name: string;
  region?: string;
  lat: number;
  lng: number;
  photos: number;
  date: string | null;
}

/**
 * The travel trail: every place on a dark map, numbered in the order they
 * were visited, joined by a dashed route — the birthday-map idea, re-set
 * into this site's system (flat, square, one amber accent).
 *
 * `focus` zooms to one stop (the place pages) instead of fitting them all.
 * Clicking a pin calls `onSelect`; the pin's popup also links to the place
 * page, so it works without the handler.
 */
export function TravelMap({
  stops,
  focus,
  onSelect,
  className = "",
  label = "Map of places Sahil Sanghvi has travelled to",
}: {
  stops: MapStop[];
  focus?: string;
  onSelect?: (slug: string) => void;
  className?: string;
  label?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!el.current || stops.length === 0) return;
    let disposed = false;
    let map: import("leaflet").Map | null = null;

    // Leaflet touches `window` on import, so it loads in the browser only.
    void import("leaflet").then((L) => {
      if (disposed || !el.current) return;
      map = L.map(el.current, {
        zoomControl: false,
        scrollWheelZoom: false, // don't hijack page scroll; ctrl/⌘+scroll or the buttons zoom
        worldCopyJump: true,
        attributionControl: true,
      });
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(map);

      const m = map;
      el.current.addEventListener("wheel", (e) => {
        if (e.ctrlKey || e.metaKey) m.scrollWheelZoom.enable();
        else m.scrollWheelZoom.disable();
      });

      L.polyline(
        stops.map((s) => [s.lat, s.lng] as [number, number]),
        { className: "travel-trail", weight: 2, dashArray: "2 8", lineCap: "round", opacity: 0.8 }
      ).addTo(map);

      stops.forEach((s, i) => {
        const isFocus = s.slug === focus;
        const size = isFocus ? 34 : 26;
        const marker = L.marker([s.lat, s.lng], {
          title: s.region ? `${s.name}, ${s.region}` : s.name,
          zIndexOffset: isFocus ? 1000 : 0,
          keyboard: true,
          icon: L.divIcon({
            className: "",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            html: `<span class="travel-pin${isFocus ? " is-focus" : ""}">${String(i + 1).padStart(2, "0")}</span>`,
          }),
        }).addTo(m);

        const popup = document.createElement("div");
        popup.className = "travel-popup";
        const title = document.createElement("a");
        title.href = `/travel/${s.slug}`;
        title.textContent = s.name;
        const meta = document.createElement("span");
        meta.textContent = [s.region, s.date, `${s.photos} photo${s.photos === 1 ? "" : "s"}`]
          .filter(Boolean)
          .join(" · ");
        popup.append(title, meta);
        marker.bindPopup(popup, { closeButton: false, offset: [0, -size / 2] });
        marker.on("click", () => onSelectRef.current?.(s.slug));
      });

      const target = focus ? stops.find((s) => s.slug === focus) : null;
      if (target) map.setView([target.lat, target.lng], 11);
      else if (stops.length === 1) map.setView([stops[0].lat, stops[0].lng], 10);
      else map.fitBounds(L.latLngBounds(stops.map((s) => [s.lat, s.lng] as [number, number])).pad(0.15));
    });

    return () => {
      disposed = true;
      map?.remove();
    };
  }, [stops, focus]);

  return (
    <div
      ref={el}
      role="region"
      aria-label={label}
      className={`travel-map border-border bg-ink-900 relative z-0 border ${className}`}
    />
  );
}
