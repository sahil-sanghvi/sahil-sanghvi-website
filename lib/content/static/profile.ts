import type { Profile } from "../types";

/**
 * Edit this file, commit, push — Vercel redeploys with the change.
 *
 * `headline` renders as the landing hero. Keep the " — " separator: the
 * clause after it gets the accent colour and wraps to a second line
 * (see components/site/pane-readme.tsx).
 */
export const profile: Profile = {
  full_name: "Sahil Sanghvi",
  headline: "I build the whole thing — the product, and the pipeline that runs it.",
  bio_md:
    "Computer Science student at the University of Victoria (Software Systems specialization). I build complete software products — the app, the data pipeline behind it, and the automation that keeps it running without me. I recently wrapped up an ML Research Fellowship with RBC Borealis' Let's Solve It cohort and an AI internship at Protean eGov Technologies. Before university I taught Python and C/C++ to 500+ students, and I lead UVic's UMANG Indian Students Association as Vice President.",
  location: "Victoria, BC",
  public_email: "ssanghvi@uvic.ca",
  socials: {
    GitHub: "https://github.com/sahil-sanghvi",
    LinkedIn: "https://linkedin.com/in/sahil-mit-sanghvi",
  },
  available_for_work: true,
  resume_url: "/resume.pdf",
};
