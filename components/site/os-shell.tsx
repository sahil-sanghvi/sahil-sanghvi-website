"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Profile, Skill, Experience, Project } from "@/lib/content";
import type { TimelineItem } from "@/lib/site/timeline";
import { aggregateLanguages } from "@/lib/site/format";
import { Scene3DBackground } from "./scene-3d-background";
import { ReadmePane } from "./pane-readme";
import { ExperiencePane } from "./pane-experience";
import { ProjectsPane } from "./pane-projects";
import { ContactPane } from "./pane-contact";

export type ShellProfile = Profile;
export type ShellSkill = Skill;
export type ShellExperience = Experience;
export type ShellProject = Project;
export type ShellMetrics = { repos: number; stars: number; available: boolean };

type FileId = "readme" | "experience" | "projects" | "contact";

const FILES: { id: FileId; name: string; kind: string; path: string }[] = [
  { id: "readme", name: "README.md", kind: "MD", path: "~/portfolio/README.md" },
  { id: "experience", name: "Experience.tsx", kind: "TS", path: "~/portfolio/src/career/Experience.tsx" },
  { id: "projects", name: "Projects.json", kind: "JSON", path: "~/portfolio/src/lab/Projects.json" },
  { id: "contact", name: "contact.sh", kind: "SH", path: "~/portfolio/bin/contact.sh" },
];

function Clock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="text-primary tabular-nums">{time ?? "--:--:--"}</span>;
}

export function OsShell({
  profile,
  skills,
  experience,
  projects,
  timeline,
  metrics,
}: {
  profile: ShellProfile | null;
  skills: ShellSkill[];
  experience: ShellExperience[];
  projects: ShellProject[];
  timeline: TimelineItem[];
  metrics: ShellMetrics;
}) {
  const [active, setActive] = useState<FileId>("readme");
  const [open, setOpen] = useState<FileId[]>(["readme"]);
  const [pulse, setPulse] = useState(0);

  const activeFile = useMemo(() => FILES.find((f) => f.id === active)!, [active]);
  const languages = useMemo(
    () => aggregateLanguages(projects.map((p) => ({ languages: p.project_github?.languages ?? null }))),
    [projects]
  );
  const handle = (profile?.full_name?.split(" ")[0] || "sahil").toLowerCase();

  const burst = () => setPulse((p) => p + 1);

  const openFile = (id: FileId) => {
    setActive(id);
    setOpen((prev) => (prev.includes(id) ? prev : [...prev, id]));
    burst();
  };

  const closeFile = (id: FileId) => {
    burst();
    setOpen((prev) => {
      const next = prev.filter((f) => f !== id);
      if (next.length === 0) return prev;
      if (id === active) setActive(next[next.length - 1]);
      return next;
    });
  };

  return (
    <div className="theme-shell font-mono h-dvh overflow-hidden flex flex-col bg-background text-foreground">
      {/* OS top bar */}
      <header className="h-9 border-b border-border flex items-center px-3 sm:px-4 justify-between bg-panel/60 backdrop-blur-md sticky top-0 z-50">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <div className="flex shrink-0 items-center gap-2">
            <div className="size-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase">{handle}.os</span>
          </div>
          <nav className="hidden sm:flex gap-4 text-[10px] text-muted-foreground">
            <span className="text-foreground">File</span>
            <span>Edit</span>
            <span>View</span>
            <Link href="/terminal" className="hover:text-primary transition-colors">
              Terminal
            </Link>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-[10px] text-muted-foreground">
          {profile?.resume_url ? (
            <a
              href={profile.resume_url}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline hover:text-primary transition-colors"
            >
              Résumé
            </a>
          ) : null}
          {profile?.socials?.GitHub ? (
            <a
              href={profile.socials.GitHub}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline hover:text-primary transition-colors"
            >
              GitHub
            </a>
          ) : null}
          {profile?.socials?.LinkedIn ? (
            <a
              href={profile.socials.LinkedIn}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline hover:text-primary transition-colors"
            >
              LinkedIn
            </a>
          ) : null}
          <span className="hidden sm:inline">{metrics.available ? "OPEN TO WORK" : "NOT AVAILABLE"}</span>
          <Clock />
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Explorer sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 border-r border-border bg-panel flex-col">
          <div className="p-4 border-b border-border">
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-3">Directory</div>
            <div className="flex items-center gap-2 px-2 py-1.5 bg-foreground/5">
              <span className="text-primary text-xs">▼</span>
              <span className="text-xs font-medium">portfolio</span>
            </div>
            <div className="pl-4 mt-1 space-y-0.5">
              {FILES.map((f) => {
                const isActive = f.id === active;
                return (
                  <button
                    key={f.id}
                    onClick={() => openFile(f.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1 text-xs text-left transition-colors ${
                      isActive
                        ? "text-foreground bg-primary/10 border-r-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    }`}
                  >
                    <span className={`text-[10px] shrink-0 ${isActive ? "text-primary" : "opacity-40"}`}>
                      {f.kind}
                    </span>
                    <span className="truncate">{f.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {languages.length > 0 ? (
            <div className="mt-auto p-4 border-t border-border">
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-3">Language Mix</div>
              <div className="space-y-3">
                {languages.map((l) => (
                  <div key={l.name}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span>{l.name}</span>
                      <span className="text-muted-foreground tabular-nums">{l.value}%</span>
                    </div>
                    <div className="h-1 bg-border overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${l.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        {/* Editor pane */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Tabs */}
          <div className="h-10 border-b border-border flex items-center bg-panel/40 overflow-x-auto">
            <div className="flex h-full">
              {open.map((id) => {
                const f = FILES.find((x) => x.id === id)!;
                const isActive = id === active;
                return (
                  <div
                    key={id}
                    className={`h-full px-4 border-r border-border flex items-center gap-3 cursor-pointer whitespace-nowrap transition-colors duration-150 ${
                      isActive ? "bg-background border-t-2 border-t-primary" : "text-muted-foreground"
                    }`}
                    onClick={() => openFile(id)}
                  >
                    <span className="text-xs">{f.name}</span>
                    <button
                      aria-label={`Close ${f.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        closeFile(id);
                      }}
                      className="text-[10px] text-muted-foreground hover:text-primary"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex-1" />
            <div className="px-4 text-[10px] text-muted-foreground hidden lg:block">{activeFile.path}</div>
          </div>

          {/* Body */}
          <div className="relative flex flex-1 min-w-0 min-h-0 overflow-y-auto">
            <Scene3DBackground variant={active} pulse={pulse} />
            <div className="relative hidden sm:block w-12 shrink-0 pt-8 pr-4 text-right text-muted-foreground/30 text-[10px] leading-[1.6] select-none border-r border-border/50">
              {Array.from({ length: 60 }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            <div className="relative flex-1 min-w-0 max-w-4xl mx-auto p-6 md:p-12">
              <div key={active}>
                {active === "readme" && <ReadmePane profile={profile} skills={skills} timeline={timeline} />}
                {active === "experience" && <ExperiencePane experience={experience} />}
                {active === "projects" && <ProjectsPane projects={projects} />}
                {active === "contact" && <ContactPane profile={profile} />}
              </div>
            </div>

            <div className="w-28 shrink-0 border-l border-border/50 bg-panel/20 hidden xl:block py-8">
              <div className="px-4 space-y-2 opacity-30">
                <div className="h-32 bg-foreground/10" />
                <div className="h-16 bg-foreground/10" />
                <div className="h-56 bg-foreground/10 border-2 border-primary/40" />
                <div className="h-24 bg-foreground/10" />
              </div>
            </div>
          </div>

          {/* Mobile file switcher */}
          <div className="md:hidden border-t border-border bg-panel flex overflow-x-auto">
            {FILES.map((f) => (
              <button
                key={f.id}
                onClick={() => openFile(f.id)}
                className={`px-4 py-3 text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors duration-150 ${
                  f.id === active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </main>
      </div>

      {/* Status bar */}
      <footer className="h-7 border-t border-border bg-panel flex items-center px-4 justify-between text-[9px] tracking-wider uppercase font-bold shrink-0">
        <div className="flex items-center gap-6">
          <span>
            <span className="text-primary">BRANCH:</span> MAIN
          </span>
          <span className="hidden sm:inline">
            <span className="text-primary">REPOS:</span> {metrics.repos}
          </span>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="hidden sm:flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-signal" />
            {metrics.available ? "OPEN TO WORK" : "NOT AVAILABLE"}
          </span>
          <span>UTF-8</span>
          <span className="animate-blink text-primary">_</span>
        </div>
      </footer>
    </div>
  );
}
