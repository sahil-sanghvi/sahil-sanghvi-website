"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

/**
 * Mounted once in the root layout.
 * - `domAnimation` (~6KB) instead of the full bundle (~34KB); `strict` throws
 *   if any leaf imports `motion` instead of `m`, so the budget is enforced,
 *   not just documented. If a future component genuinely needs layout
 *   animation or drag, wrap that one component in a route-local
 *   `LazyMotion features={domMax}` rather than upgrading this globally.
 * - `reducedMotion="user"` disables transform/scale animations under
 *   prefers-reduced-motion while preserving opacity ones — movement is what
 *   triggers motion sickness, not fading.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
