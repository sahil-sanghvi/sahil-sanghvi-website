import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-section-head text-muted-foreground uppercase">Admin</p>
      <div className="mt-4 flex flex-col gap-2 pl-6">
        <Link href="/admin/profile" className="text-body text-signal-500 hover:text-signal-600">
          → Profile
        </Link>
        <Link href="/admin/projects" className="text-body text-signal-500 hover:text-signal-600">
          → Projects
        </Link>
        <Link href="/admin/experience" className="text-body text-signal-500 hover:text-signal-600">
          → Experience
        </Link>
        <Link href="/admin/education" className="text-body text-signal-500 hover:text-signal-600">
          → Education
        </Link>
        <Link href="/admin/skills" className="text-body text-signal-500 hover:text-signal-600">
          → Skills
        </Link>
        <Link href="/admin/faqs" className="text-body text-signal-500 hover:text-signal-600">
          → FAQs
        </Link>
        <Link href="/admin/github" className="text-body text-signal-500 hover:text-signal-600">
          → GitHub ingest
        </Link>
        <Link href="/admin/resume" className="text-body text-signal-500 hover:text-signal-600">
          → Resume ingest
        </Link>
      </div>
    </div>
  );
}
