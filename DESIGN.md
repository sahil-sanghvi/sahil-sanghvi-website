in <!-- SEED: established with the user before implementation; re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: sahil-sanghvi(1)
description: A personal portfolio that renders as a real Unix manual page — structure does the persuading, not marketing copy.
---

# Design System: sahil-sanghvi(1)

## Overview

**Creative North Star: "The Man Page"**

The landing page refuses the hero-and-headline format entirely. It opens as a document a recruiter would `man` a person: a running header bar (`SAHIL-SANGHVI(1)  General Commands Manual  SAHIL-SANGHVI(1)`), then canonical manual sections — NAME, SYNOPSIS, DESCRIPTION, OPTIONS, EXAMPLES, ENVIRONMENT, SEE ALSO, BUGS, AUTHOR — carrying every real fact about Sahil in an order a technical reader already knows how to scan. The one-line SYNOPSIS *is* the hero headline, rendered large enough to read as a thesis rather than fine print, but never breaking the document's own typographic register to do it.

This was the assigned direction from a structured seven-candidate roll grounded in Sahil's own stated cultural home (systems/infra & CLI tooling — `htop`, `tmux`, `journalctl`, `man`), chosen over an aircraft-instrument-panel alternate (strong for a single stats moment, doesn't extend to prose content) and a one-bit retro-desktop alternate (charming, but reads as nostalgia rather than "rigorous automation engineer"). It deliberately avoids four ruts named during scoping: generic SaaS-template gradients and card chrome, sterile all-black minimalist-template flatness, corporate-formal stock-photo polish, and the try-hard "matrix green hacker" costume — a real `man` page is deadpan and functional, never performing "hacker."

It ties directly to the site's separate `/terminal` surface: a man page is literally something you'd `cat` or `man` inside a terminal, so the two surfaces share one material world without one imitating the other.

**Key Characteristics:**
- Single reading column, document order, no dashboard-style grid of competing panels.
- Running header/footer furniture persists on every section, anchoring the "this is a manual page" conceit.
- One accent color, used only for interactive elements (links, current nav target) — never for decoration.
- No shadows, no rounded card chrome, no gradients. Depth comes from rule lines and indentation, the way a real terminal pager renders one.

## Colors

Restrained strategy: a dark terminal-paper neutral ground and body text, plus exactly one accent reserved for anything actionable. Dark-only for v1 (a prior product decision, not re-litigated here); exact hex/OKLCH values are **[to be resolved during implementation]** against real contrast testing on the built page, but the roles below are fixed.

### Primary
- **Signal Amber** (`[to be resolved during implementation]`): The single accent. Used only for links, the active nav "page," focus rings, and the blinking-adjacent cursor motif in OPTIONS. Reserved deliberately — the accent's rarity is what makes it read as "signal" rather than decoration.

### Neutral
- **Terminal Paper** (`[to be resolved during implementation]`): The page background — dark, but warmer and less absolute than pure black, closer to a real terminal's near-black than a designer's `#000`.
- **Body Ink** (`[to be resolved during implementation]`): Primary text color. High contrast against Terminal Paper (must clear body-text contrast at final values).
- **Muted Ink** (`[to be resolved during implementation]`): Secondary text — placeholders, timestamps, section furniture (page header/footer, `SEE ALSO` cross-reference labels).
- **Rule Line** (`[to be resolved during implementation]`): Hairline dividers between manual sections. The only "structure" color besides text and the one accent.

### Named Rules
**The No-Green Rule.** Signal Amber is explicitly not a green or cyan phosphor tone. The cultural home is real systems/infra tooling, not the "hacker terminal" costume — the accent should read as deliberate signal design (think amber CRT or a calibrated warning light), never as a Matrix reference.

**The One-Accent Rule.** The accent color appears only on interactive or "live" elements. A page with no accent-colored decoration anywhere except a link or an active state is correct; if the accent starts appearing on static content, the rule has been broken.

## Typography

**Body/Display Font:** Monospace — **[specific family to be resolved during implementation]**, self-hosted via `next/font`.

**Character:** The whole system is set in one monospace family, the way a real terminal or pager has no choice but monospace. Hierarchy comes from weight, size, and the manual page's own conventions (bold, all-caps section heads) rather than from mixing typefaces.

### Hierarchy
- **Display / SYNOPSIS line** (bold, large enough to function as the page's hero statement, tight line-height): the one-line positioning statement — the only place type is allowed to be dramatically larger than body text.
- **Section heads** (bold, uppercase, e.g. `NAME`, `SYNOPSIS`, `DESCRIPTION`): rendered exactly as a real man page renders them — bold caps, no decoration, left-aligned, a blank line of rhythm above and below.
- **Body** (regular weight, comfortable reading size, generous line-height for a monospace face): the DESCRIPTION prose and section content. Measure capped for readability even though the face is monospace.
- **Flag/label style** (regular weight, used for OPTIONS entries: `-ml, --machine-learning`): styled like real CLI flag documentation — flag token first, description following, aligned in columns where the viewport allows.
- **Furniture** (small, muted-ink, tracked slightly wide): the running header/footer bar text and page-adjacent metadata — present but deliberately quiet.

### Named Rules
**The One-Family Rule.** No second typeface is introduced for "personality." Every registry component pulled in during the build gets its type re-set into this monospace system — a component that arrives with its own display serif or sans has not been translated into this world yet.

## Layout

Single centered document column, capped at a reading measure that echoes a real terminal pager width rather than a typical marketing max-width — legible as "a page you'd read in a terminal," not a magazine spread. The running header bar sits fixed or sticky at the top of the viewport exactly as a `less`-style pager convention; a matching footer bar closes the page. Section-to-section rhythm uses generous vertical space to mimic the blank-line convention that separates real man page sections — more space above a new section head than below it. Responsive behavior narrows the column but never breaks the single-column document structure; there is no multi-column dashboard layout at any breakpoint. Exact spacing scale values are established during implementation.

## Elevation & Depth

No shadows, anywhere. A man page is flat text on a flat page — there is no card, no panel, no lifted surface to cast one. Depth, where it exists at all, comes entirely from rule lines (hairline horizontal dividers between sections) and indentation (nested content, like flag descriptions, stepping in from the left margin the way real man pages indent option bodies).

### Named Rules
**The Flat Document Rule.** If a build introduces a `box-shadow` anywhere on this surface, the world has been broken — reach for a rule line or a change in indentation instead.

## Shapes

No rounded corners as a default. This is a text document, not app chrome — buttons, links, and any bounded element take sharp corners or, at most, a rule-line border, never a soft radius that would read as "card UI." The one deliberate exception, if the build needs it, is the least rounding that still reads as intentional rather than accidental (a hairline radius on a genuinely clickable control), never the soft radii typical of SaaS component libraries.

## Do's and Don'ts

### Do:
- **Do** keep the running header/footer manual-page furniture visible across every section of the landing page.
- **Do** use real man page section names (NAME, SYNOPSIS, DESCRIPTION, OPTIONS, EXAMPLES, ENVIRONMENT, SEE ALSO, BUGS, AUTHOR) rather than inventing marketing-style section labels.
- **Do** render skills as CLI-style flags (`-ml, --machine-learning`) with real descriptions, not generic skill pills or progress bars.
- **Do** re-set every 21st.dev/shadcn component pulled into the build into this monospace, flat, single-accent system before shipping it — an unmodified registry component with its own rounded cards and gradient hero has not been translated yet.

### Don't:
- **Don't** use green or cyan as the accent color — that is the "hacker terminal" cliché this direction explicitly refuses.
- **Don't** add card shadows, gradients, glows, or rounded panel chrome anywhere on this surface.
- **Don't** introduce a second typeface for "visual interest." The monospace system carries the whole hierarchy.
- **Don't** let the accent color appear on non-interactive, non-live content — its rarity is the point.
- **Don't** invent testimonials, client logos, or pricing content to fill sections that don't apply yet — real GitHub stats and real project data carry credibility instead (per PRODUCT.md).
