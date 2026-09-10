"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "synopsis", label: "SYNOPSIS" },
  { id: "options", label: "OPTIONS" },
  { id: "examples", label: "EXAMPLES" },
  { id: "history", label: "HISTORY" },
  { id: "environment", label: "ENVIRONMENT" },
  { id: "notes", label: "NOTES" },
  { id: "author", label: "AUTHOR" },
];

/**
 * The running header bar from a real `man`/`less` pager, repurposed as the
 * site's actual navigation — not a second nav layered on top of it.
 * Section links double as a scroll-spy; the active section gets the one
 * accent color, a legitimate "live state" use per DESIGN.md's One-Accent Rule.
 */
export function Navbar() {
  const [active, setActive] = useState<string>("synopsis");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    elements.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-ink-950">
      <div className="mx-auto flex max-w-4xl items-center gap-6 overflow-x-auto px-6 py-3 whitespace-nowrap">
        <Link
          href="/"
          className="text-furniture text-foreground shrink-0 tracking-wide"
        >
          SAHIL-SANGHVI(1)
        </Link>
        <nav className="flex items-center gap-5">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`text-furniture tracking-wide transition-colors ${
                active === s.id
                  ? "text-signal-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </a>
          ))}
        </nav>
        <Link
          href="/terminal"
          className="text-furniture text-signal-500 hover:text-signal-600 ml-auto shrink-0 tracking-wide transition-colors"
        >
          → TERMINAL(1)
        </Link>
      </div>
    </header>
  );
}
