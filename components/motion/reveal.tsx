"use client";

import { m } from "motion/react";
import { fadeUp } from "@/lib/motion/variants";

/**
 * Scroll-in wrapper for below-the-fold content only — never use this for
 * above-the-fold/hero content (see hero.tsx), since an IntersectionObserver
 * that never fires would leave an LCP element permanently invisible.
 *
 * `data-reveal` is the hook the CSS backstop in globals.css targets: if JS
 * never runs (disabled, hydration error) or prefers-reduced-motion is set,
 * the backstop forces opacity:1 so content is never stuck hidden.
 */
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <m.div
      data-reveal
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -10% 0px" }}
      variants={fadeUp}
    >
      {children}
    </m.div>
  );
}
