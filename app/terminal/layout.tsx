import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "sahil-sanghvi(1) — terminal",
  description: "Navigate a virtual filesystem of Sahil's projects using real commands.",
};

/**
 * Its own chrome, no site navbar/footer — this is a separate surface, not a
 * section of the landing page. Every fact reachable here also exists on the
 * ordinary site (never the only route to real content).
 */
export default function TerminalLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
