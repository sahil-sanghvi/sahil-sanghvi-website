import type { ShellProfile } from "./os-shell";

export function ContactPane({ profile }: { profile: ShellProfile | null }) {
  const socials = (profile?.socials as Record<string, string> | null) ?? {};
  const socialEntries = Object.entries(socials);
  const hasContact = Boolean(profile?.public_email) || socialEntries.length > 0;

  const lines = [
    { cmd: "$ whoami", out: profile?.full_name ?? "Sahil Sanghvi" },
    profile?.available_for_work !== undefined
      ? { cmd: "$ cat ./status", out: profile?.available_for_work ? "open to work" : "not available" }
      : null,
    profile?.public_email ? { cmd: "$ echo $MAIL", out: profile.public_email } : null,
    ...socialEntries.map(([label, url]) => ({ cmd: `$ open --${label.toLowerCase()}`, out: url })),
  ].filter((l): l is { cmd: string; out: string } => l !== null);

  return (
    <article className="animate-slide">
      <header className="mb-14">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tighter uppercase text-balance mb-6">
          Establish
          <br />
          <span className="text-primary">connection.</span>
        </h1>
      </header>

      {hasContact ? (
        <>
          <div className="border border-border bg-panel p-6 max-w-2xl text-sm">
            {lines.map((l) => (
              <div key={l.cmd} className="mb-4 last:mb-0">
                <div className="text-primary text-xs">{l.cmd}</div>
                <div className="text-foreground break-all">{l.out}</div>
              </div>
            ))}
            <div className="text-primary text-xs mt-6">
              $ <span className="animate-blink">_</span>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {profile?.public_email ? (
              <a
                href={`mailto:${profile.public_email}`}
                className="bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                Send mail
              </a>
            ) : null}
            {socialEntries.map(([label, url]) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Contact details aren&apos;t configured yet — check back soon.
        </p>
      )}
    </article>
  );
}
