"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export type SceneVariant = "readme" | "experience" | "projects" | "contact";

type Props = {
  variant: SceneVariant;
  /** Increments on every folder/tab interaction to fire a burst. */
  pulse: number;
};

function geometryFor(variant: SceneVariant): THREE.BufferGeometry {
  switch (variant) {
    case "experience":
      return new THREE.DodecahedronGeometry(1.7, 0);
    case "projects":
      return new THREE.BoxGeometry(2.2, 2.2, 2.2, 2, 2, 2);
    case "contact":
      return new THREE.OctahedronGeometry(1.9, 0);
    default:
      return new THREE.IcosahedronGeometry(1.7, 1);
  }
}

/** Fixed vertex budget so every shape can interpolate into every other one. */
const PAIRS = 512;

/**
 * Turn any geometry into a fixed-length list of edge segments, ordered by the
 * spherical angle of each segment's midpoint. The consistent ordering means
 * segment N of one shape lands near segment N of the next, so interpolating
 * between two buffers reads as a shape folding into another rather than noise.
 */
function edgeCloud(variant: SceneVariant): Float32Array {
  const geo = geometryFor(variant);
  const edges = new THREE.EdgesGeometry(geo);
  const src = edges.attributes.position.array as ArrayLike<number>;
  const srcPairs = Math.max(1, Math.floor(src.length / 6));

  const list: { key: number; k2: number; v: number[] }[] = [];
  for (let i = 0; i < srcPairs; i++) {
    const o = i * 6;
    const ax = src[o],
      ay = src[o + 1],
      az = src[o + 2];
    const bx = src[o + 3],
      by = src[o + 4],
      bz = src[o + 5];
    const mx = (ax + bx) / 2,
      my = (ay + by) / 2,
      mz = (az + bz) / 2;
    list.push({
      key: Math.atan2(mz, mx),
      k2: Math.atan2(my, Math.hypot(mx, mz)),
      v: [ax, ay, az, bx, by, bz],
    });
  }
  list.sort((p, q) => p.key - q.key || p.k2 - q.k2);

  const out = new Float32Array(PAIRS * 6);
  for (let i = 0; i < PAIRS; i++) {
    // Resample (repeat or skip) so shapes with different edge counts still map.
    const s = list[Math.floor((i * list.length) / PAIRS) % list.length].v;
    out.set(s, i * 6);
  }

  geo.dispose();
  edges.dispose();
  return out;
}

/**
 * Browser-only ambient 3D layer that reacts to shell navigation: the core
 * morphs per open file and bursts on each click.
 */
export default function Scene3D({ variant, pulse }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const variantRef = useRef(variant);
  const pulseRef = useRef(pulse);
  const morphRef = useRef<((v: SceneVariant) => void) | null>(null);
  const burstRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // globals.css defines these tokens as oklch(...), and browsers that
    // support CSS Color 4 normalize a custom property's value at parse
    // time — reading it back via getComputedStyle comes back serialized as
    // e.g. lab(64.1 50.67 65.51), which THREE.Color's parser (rgb/hsl/hex/
    // named only) can't read; it throws and the scene silently falls back
    // to the hardcoded hex below. Painting the color onto a 1x1 canvas and
    // reading the pixel back gives a guaranteed sRGB byte triple regardless
    // of the input color space — a canvas fillStyle round-trip alone isn't
    // enough, modern Chromium preserves lab()/oklch() in the getter too.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const toRgb = (css: string): string | null => {
      if (!ctx) return null;
      try {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return a === 0 ? null : `rgb(${r} ${g} ${b})`;
      } catch {
        return null;
      }
    };

    // Read from `host` (inside .theme-shell), not <html> — this scene lives
    // under a locally-scoped palette (see .theme-shell in globals.css), and
    // <html> only carries the global man-page tokens.
    const read = (name: string, fallback: string) => {
      const v = getComputedStyle(host).getPropertyValue(name).trim();
      const rgb = v ? toRgb(v) : null;
      try {
        return new THREE.Color(rgb || fallback);
      } catch {
        return new THREE.Color(fallback);
      }
    };

    const accent = read("--primary", "#f59042");
    const dim = read("--muted-foreground", "#8b8b95");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 1.1, 13);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    // Grid floor
    const grid = new THREE.GridHelper(40, 40, accent, dim);
    (grid.material as THREE.Material).opacity = 0.12;
    (grid.material as THREE.Material).transparent = true;
    grid.position.y = -2.2;
    scene.add(grid);

    // Wireframe core (morphs per active file)
    const coreMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.28 });
    const morphFrom = edgeCloud(variantRef.current);
    const morphTo = morphFrom.slice();
    const live = morphFrom.slice();
    const coreGeo = new THREE.BufferGeometry();
    coreGeo.setAttribute("position", new THREE.BufferAttribute(live, 3));
    (coreGeo.attributes.position as THREE.BufferAttribute).setUsage(THREE.DynamicDrawUsage);
    const core = new THREE.LineSegments(coreGeo, coreMat);
    scene.add(core);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.6, 0),
      new THREE.MeshBasicMaterial({
        color: dim,
        wireframe: true,
        transparent: true,
        opacity: 0.07,
      })
    );
    scene.add(shell);

    // Shockwave ring emitted on interaction
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 1.72, 64),
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2.6;
    scene.add(ring);

    // Particle field
    const count = 320;
    const positions = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    base.set(positions);
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pointsMat = new THREE.PointsMaterial({ color: accent, size: 0.028, transparent: true, opacity: 0.3 });
    const points = new THREE.Points(pointsGeo, pointsMat);
    scene.add(points);

    // Deterministic camera framing per section — same file always returns
    // to the same viewpoint, so navigation feels composed rather than random.
    const VIEWS: Record<SceneVariant, { az: number; el: number; r: number }> = {
      readme: { az: 0.5, el: 0.2, r: 13 },
      experience: { az: 2.0, el: 0.34, r: 12.2 },
      projects: { az: 3.7, el: 0.1, r: 12.8 },
      contact: { az: 5.2, el: 0.42, r: 11.8 },
    };

    const orbit = { az: 0.5, el: 0.2, r: 13 };
    const orbitTarget = { az: 0.5, el: 0.2, r: 13 };
    let drift = 0;

    const aimAt = (v: SceneVariant) => {
      const view = VIEWS[v] ?? VIEWS.readme;
      // Take the shortest path around the circle from where we currently are.
      const current = orbitTarget.az - drift;
      const delta = ((view.az - current + Math.PI) % (Math.PI * 2)) - Math.PI;
      orbitTarget.az = current + (delta < -Math.PI ? delta + Math.PI * 2 : delta) + drift;
      orbitTarget.el = view.el;
      orbitTarget.r = view.r;
    };

    // Morph state: interpolate the live buffer from -> to over MORPH_MS.
    const MORPH = 0.5;
    let morphAt = -10;
    morphRef.current = (v: SceneVariant) => {
      morphFrom.set(live);
      morphTo.set(edgeCloud(v));
      morphAt = clock.getElapsedTime();
      aimAt(v);
    };

    let burstAt = -10;
    burstRef.current = () => {
      burstAt = clock.getElapsedTime();
    };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    let raf = 0;
    let spin = 0;
    // Look below the geometry so the object sits in the upper half of the pane.
    const focus = new THREE.Vector3(0, -3.4, 0);

    let last = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      const dt = Math.min(t - last, 0.05);
      last = t;
      // Frame-rate independent damping helper.
      const damp = (rate: number) => 1 - Math.exp(-rate * dt);

      pointer.x += (target.x - pointer.x) * damp(3);
      pointer.y += (target.y - pointer.y) * damp(3);

      // Burst envelope: soft ease-in/out swell over ~1.6s
      const age = t - burstAt;
      const bp = age >= 0 && age < 1.6 ? age / 1.6 : -1;
      const burst = bp >= 0 ? Math.sin(bp * Math.PI) ** 2 : 0;

      // Shape morph: ease every edge segment from the previous shape into the next one.
      const mAge = t - morphAt;
      if (mAge >= 0 && mAge <= MORPH + 0.05) {
        const p = Math.min(mAge / MORPH, 1);
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        for (let i = 0; i < live.length; i++) {
          live[i] = morphFrom[i] + (morphTo[i] - morphFrom[i]) * e;
        }
        (coreGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      }

      if (!reduced) {
        spin += (0.18 + burst * 0.3) * dt;
        core.rotation.y = t * 0.18 + spin;
        core.rotation.x = Math.sin(t * 0.25) * 0.28;
        shell.rotation.y = -t * 0.08;
        shell.rotation.z = t * 0.05;
        points.rotation.y = t * 0.02;
        // Continuous slow orbit drift
        drift += 0.09 * dt;
        orbitTarget.az += 0.09 * dt;
      }

      shell.scale.setScalar(1 + burst * 0.09);
      coreMat.opacity = 0.28 + burst * 0.36;
      pointsMat.opacity = 0.3 + burst * 0.3;
      pointsMat.size = 0.028 + burst * 0.02;

      // Particles push outward on burst
      const arr = pointsGeo.attributes.position.array as Float32Array;
      const push = 1 + burst * 0.12;
      for (let i = 0; i < arr.length; i++) arr[i] = base[i] * push;
      pointsGeo.attributes.position.needsUpdate = true;

      // Shockwave ring
      const ringMat = ring.material as THREE.MeshBasicMaterial;
      if (bp >= 0) {
        const eased = 1 - Math.pow(1 - bp, 3);
        ring.scale.setScalar(0.6 + eased * 3.4);
        ringMat.opacity = (1 - eased) * 0.3;
      } else {
        ringMat.opacity = 0;
      }

      // Ease the camera toward the current orbit angle
      const k = damp(1.6);
      orbit.az += (orbitTarget.az - orbit.az) * k;
      orbit.el += (orbitTarget.el - orbit.el) * k;
      orbit.r += (orbitTarget.r - orbit.r) * damp(1.8);

      const az = orbit.az + pointer.x * 0.25;
      const el = THREE.MathUtils.clamp(orbit.el - pointer.y * 0.15, -0.5, 0.9);
      const r = orbit.r;

      camera.position.set(
        Math.sin(az) * Math.cos(el) * r,
        Math.sin(el) * r + 0.6,
        Math.cos(az) * Math.cos(el) * r
      );
      camera.lookAt(focus);
      renderer.render(scene, camera);
    };

    tick();

    return () => {
      morphRef.current = null;
      burstRef.current = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      renderer.dispose();
      scene.traverse((obj) => {
        const any = obj as THREE.Mesh;
        any.geometry?.dispose?.();
        const m = any.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else m?.dispose?.();
      });
      host.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    variantRef.current = variant;
    morphRef.current?.(variant);
  }, [variant]);

  useEffect(() => {
    if (pulse === pulseRef.current) return;
    pulseRef.current = pulse;
    burstRef.current?.();
  }, [pulse]);

  return <div ref={hostRef} className="absolute inset-0" aria-hidden />;
}
