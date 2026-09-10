import { getProfile, getSkills, getExperience, getProjects } from "@/lib/content";
import type { VDir, VFile } from "./types";

const README_CAP = 40_000; // ~40KB per project in the snapshot

/**
 * Builds the terminal's virtual filesystem from the same content source as
 * the rest of the site (lib/content) — static files by default, the DB in
 * automated mode. Every fact reachable here also exists on the ordinary site
 * (PRODUCT.md accessibility commitment): this is a novelty layer over the
 * same data, never the only route to it.
 */
export async function buildFilesystem(): Promise<VDir> {
  const [profile, skills, experience, projects] = await Promise.all([
    getProfile(),
    getSkills(),
    getExperience(),
    getProjects(),
  ]);

  const skillsFile: VFile = {
    type: "file",
    name: "skills.txt",
    content:
      skills.length > 0
        ? skills.map((s) => `${s.name}\t${s.description ?? ""}`).join("\n")
        : "(no skills listed yet)",
  };

  const contactFile: VFile = {
    type: "file",
    name: "contact.txt",
    content:
      [
        profile.public_email ? `email: ${profile.public_email}` : null,
        ...Object.entries(profile.socials).map(([k, v]) => `${k.toLowerCase()}: ${v}`),
      ]
        .filter(Boolean)
        .join("\n") || "(contact details not configured yet)",
  };

  const aboutFile: VFile = {
    type: "file",
    name: "about.md",
    content: profile.bio_md ?? "(bio not set yet)",
  };

  const experienceDir: Record<string, VFile> = {};
  for (const e of experience) {
    const fname = `${e.start_date.slice(0, 4)}-${slugify(e.org)}.md`;
    experienceDir[fname] = {
      type: "file",
      name: fname,
      content: [
        `${e.role} @ ${e.org}`,
        `${e.start_date.slice(0, 7)} — ${e.end_date ? e.end_date.slice(0, 7) : "present"}`,
        e.location ? e.location : null,
        "",
        e.summary_md ?? "",
        e.highlights.length > 0 ? "\n" + e.highlights.map((h) => `- ${h}`).join("\n") : "",
      ]
        .filter((l) => l !== null)
        .join("\n"),
    };
  }

  const projectsDir: Record<string, VDir> = {};
  for (const p of projects) {
    const gh = p.project_github;
    const children: Record<string, VFile> = {
      "description.md": {
        type: "file",
        name: "description.md",
        content: p.description_md ?? p.tagline ?? "(no description yet)",
      },
      "meta.json": {
        type: "file",
        name: "meta.json",
        content: JSON.stringify(
          {
            title: p.title,
            tagline: p.tagline,
            repo_url: p.repo_url,
            live_url: p.live_url,
            stars: gh?.stars ?? 0,
            primary_language: gh?.primary_language ?? null,
            languages: gh?.languages ?? {},
            topics: gh?.topics ?? [],
          },
          null,
          2
        ),
      },
    };

    if (gh?.readme_md) {
      children["README.md"] = {
        type: "file",
        name: "README.md",
        content:
          gh.readme_md.length > README_CAP
            ? `${gh.readme_md.slice(0, README_CAP)}\n\n… (truncated — see /projects/${p.slug})`
            : gh.readme_md,
      };
    }

    const dir: VDir = { type: "dir", name: p.slug, children };
    if (gh) {
      dir.git = { owner: gh.owner, repo: gh.repo, branch: gh.default_branch };
    }
    projectsDir[p.slug] = dir;
  }

  const home: VDir = {
    type: "dir",
    name: "sahil",
    children: {
      "about.md": aboutFile,
      "contact.txt": contactFile,
      "skills.txt": skillsFile,
      "resume.pdf": { type: "file", name: "resume.pdf", content: "", binary: true, href: "/resume.pdf" },
      experience: { type: "dir", name: "experience", children: experienceDir },
      projects: { type: "dir", name: "projects", children: projectsDir },
    },
  };

  const root: VDir = {
    type: "dir",
    name: "/",
    children: {
      etc: {
        type: "dir",
        name: "etc",
        children: {
          motd: {
            type: "file",
            name: "motd",
            content:
              "Welcome. Type `help` for commands, `ls` to look around, `cd projects` to explore.\nThis terminal reads the same content as the rest of the site, straight from GitHub.",
          },
        },
      },
      usr: {
        type: "dir",
        name: "usr",
        children: {
          share: {
            type: "dir",
            name: "share",
            children: {
              doc: {
                type: "dir",
                name: "doc",
                children: {
                  "help.txt": { type: "file", name: "help.txt", content: "Run `help` for the command list." },
                },
              },
            },
          },
        },
      },
      home: { type: "dir", name: "home", children: { sahil: home } },
    },
  };

  return root;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
