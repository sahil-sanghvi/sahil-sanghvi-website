// Plain data — no "use client". Values mirror the CSS tokens in globals.css
// exactly, so motion and static styles share one source of truth. Importable
// from either side of the RSC boundary (see components/motion/ for the client
// leaves that actually consume these).

export const EASE = {
  out: [0.23, 1, 0.32, 1] as const,
  inOut: [0.77, 0, 0.175, 1] as const,
  drawer: [0.32, 0.72, 0, 1] as const,
};

export const DURATION = {
  press: 0.12,
  tooltip: 0.16,
  menu: 0.2,
  overlay: 0.28, // 300ms hard ceiling for UI transitions
};

// Motion v12 duration/bounce spring form.
export const SPRING = {
  move: { type: "spring", duration: 0.4, bounce: 0 } as const, // damping 1.0, critically damped
  sheet: { type: "spring", duration: 0.3, bounce: 0.12 } as const,
};

export const STAGGER = 0.045; // 45ms between items

// Entrances start from 0.95, never 0 — content-hidden-at-rest is an error
// severity issue when it never recovers (see components/motion/reveal.tsx).
export const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.overlay, ease: EASE.out } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.overlay, ease: EASE.out } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: DURATION.overlay, ease: EASE.out } },
};

export const staggerParent = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER } },
};
