"use client";

import dynamic from "next/dynamic";
import type { SceneVariant } from "./scene-3d";

// Client-only: three.js touches WebGL/canvas APIs that don't exist during SSR.
const Scene3D = dynamic(() => import("./scene-3d"), { ssr: false });

export function Scene3DBackground({ variant, pulse }: { variant: SceneVariant; pulse: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <Scene3D variant={variant} pulse={pulse} />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
    </div>
  );
}
