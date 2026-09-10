-- Placeholder seed data.
--
-- Per PRODUCT.md's "Evidence on Hand" section, no specific project names,
-- employers, or metrics are fabricated here. This seeds the profile
-- singleton row (which the schema requires exactly one of), the three real
-- capability areas as OPTIONS/skills entries, and a couple of FAQ entries
-- that are honestly true today — about the site's own mechanism — rather
-- than invented facts about Sahil. Projects and experience ship with zero
-- rows and render as real empty states until GitHub ingest, resume ingest,
-- or manual admin entry populates them.

insert into profile (
  singleton, full_name, headline, bio_md, available_for_work
)
values (
  true,
  'Sahil Sanghvi',
  'CS student building full end-to-end software products, agentic automation pipelines, and ML-based data analysis.',
  'This bio is a placeholder — replace it from the admin panel once it exists (build increment 8).',
  true
)
on conflict (singleton) do nothing;

insert into skills (name, description, category, featured, sort_order, status)
values
  ('-fs, --full-stack', 'Design, build, and ship complete products end to end — this site included.', 'practice', true, 0, 'published'),
  ('-auto, --automation', 'Agentic pipelines that do real work without a human in the loop: GitHub ingest, resume parsing, provider failover.', 'practice', true, 1, 'published'),
  ('-ml, --machine-learning', 'Data analysis and model pipelines — turning raw data into something a product can act on.', 'practice', true, 2, 'published')
on conflict (lower(name)) do nothing;

insert into faqs (question, answer_md, sort_order, status)
values
  (
    'How is this site kept up to date?',
    'Projects populate from pasting a GitHub repo URL into an admin panel, which pulls metadata, the README, and commit history automatically. Experience and skills can be extracted from an uploaded resume, but nothing publishes until it''s reviewed and approved by hand.',
    0,
    'published'
  ),
  (
    'Is this actually a real automation pipeline, or just a metaphor?',
    'Real. The ingest jobs, provider failover, and review queue described on this site are the same category of system referenced in the SYNOPSIS above — this page is a working example of it, not just a description.',
    1,
    'published'
  )
on conflict do nothing;
