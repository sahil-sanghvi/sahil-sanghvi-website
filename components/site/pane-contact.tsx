import { useActionState } from "react";
import type { ShellProfile } from "./os-shell";
import { sendContactMessage, type ContactState } from "@/lib/email/send-contact-message";

const INPUT_CLASS =
  "border border-border bg-background text-foreground text-sm px-3 py-2 focus:border-primary focus:outline-none w-full";

const initialState: ContactState = { status: "idle", message: "" };

function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);

  if (state.status === "sent") {
    return (
      <div className="border border-border bg-panel p-6 max-w-2xl text-sm">
        <p className="text-primary text-xs mb-2">$ mail --send</p>
        <p className="text-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="border border-border bg-panel p-6 max-w-2xl flex flex-col gap-3">
      {/* Honeypot — hidden from real visitors via CSS (not display:none, which
          some bots skip), left in the tab order behind the viewport. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] w-px h-px opacity-0"
      />
      <div>
        <label htmlFor="contact-name" className="text-primary text-xs">
          $ read name
        </label>
        <input id="contact-name" name="name" required className={`${INPUT_CLASS} mt-1`} />
      </div>
      <div>
        <label htmlFor="contact-email" className="text-primary text-xs">
          $ read email
        </label>
        <input id="contact-email" name="email" type="email" required className={`${INPUT_CLASS} mt-1`} />
      </div>
      <div>
        <label htmlFor="contact-message" className="text-primary text-xs">
          $ read message
        </label>
        <textarea id="contact-message" name="message" rows={4} required className={`${INPUT_CLASS} mt-1`} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 self-start mt-2"
      >
        {pending ? "sending…" : "send message"}
      </button>
      {state.status === "error" ? <p className="text-destructive text-xs">{state.message}</p> : null}
    </form>
  );
}

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
            {profile?.resume_url ? (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noreferrer"
                className="border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
              >
                Résumé
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

          <h2 className="font-display text-2xl uppercase tracking-tighter mt-16 mb-6">Or just say hi</h2>
          <ContactForm />
        </>
      ) : (
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Contact details aren&apos;t configured yet — check back soon.
        </p>
      )}
    </article>
  );
}
