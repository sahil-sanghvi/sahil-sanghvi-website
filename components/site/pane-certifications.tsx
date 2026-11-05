import type { ShellCertification } from "./os-shell";
import { formatPeriod } from "@/lib/site/format";

export function CertificationsPane({ certifications }: { certifications: ShellCertification[] }) {
  return (
    <article className="animate-slide">
      <header className="mb-14">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tighter uppercase text-balance mb-6">
          Certifications
          <br />
          <span className="text-primary">earned.</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Completed training and credentials, each with the original certificate attached.
        </p>
      </header>

      {certifications.length > 0 ? (
        <div className="flex flex-col divide-y divide-border border-t border-b border-border">
          {certifications.map((c) => (
            <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
              <div className="min-w-0">
                <div className="text-[11px] text-primary tabular-nums mb-2">
                  {formatPeriod(c.issued_on, c.issued_on, false)}
                </div>
                <h3 className="text-sm text-foreground leading-relaxed mb-1">{c.title}</h3>
                <div className="text-xs text-muted-foreground">Issued by {c.issuer}</div>
              </div>
              {c.credential_url ? (
                <a
                  href={c.credential_url}
                  target="_blank"
                  rel="noreferrer"
                  className="self-start sm:self-center shrink-0 border border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
                >
                  View certificate
                </a>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">No certifications listed yet.</p>
      )}
    </article>
  );
}
