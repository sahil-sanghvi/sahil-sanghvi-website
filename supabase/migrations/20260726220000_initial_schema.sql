-- sahil-sanghvi(1) portfolio — initial schema.
-- See PRODUCT.md / .claude/plans/build-a-modern-portfolio-frolicking-crown.md §2
-- for the rationale behind each table and design decision referenced in comments below.

create extension if not exists "moddatetime" schema extensions;
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- Every publicly-readable table carries this check instead of a Postgres enum:
-- enums need `alter type` gymnastics to extend, checks are a one-line migration.
-- comment convention: `status` is the single publish gate for the whole site.

-- =========================================================================
-- admin_allowlist — the auth root of trust. Seeded with exactly one row
-- after Sahil's account exists (see README / deployment notes).
-- =========================================================================
create table admin_allowlist (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- profile — singleton. `singleton` + a unique index enforces exactly one row.
-- =========================================================================
create table profile (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique,
  full_name text,
  headline text,
  bio_md text,
  bio_html text,
  avatar_url text,
  location text,
  public_email text,
  socials jsonb not null default '{}'::jsonb, -- {github, linkedin, x, email}
  resume_public_url text,
  available_for_work boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profile_moddatetime
  before update on profile
  for each row execute procedure extensions.moddatetime(updated_at);

-- =========================================================================
-- projects — human-authored layer.
-- =========================================================================
create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text,
  description_md text,
  description_html text,
  role text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  sort_order int not null default 0,
  cover_image_url text,
  cover_blur_data text, -- base64 LQIP, generated at ingest
  live_url text,
  repo_url text,
  tech text[] not null default '{}',
  started_on date,
  ended_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger projects_moddatetime
  before update on projects
  for each row execute procedure extensions.moddatetime(updated_at);

create index projects_status_sort_idx on projects (status, sort_order);

-- =========================================================================
-- project_github — machine-authored cache, 1:1 with projects.
-- Never `select('*')` from this in a list view — readme_md / readme_html /
-- raw are tens of KB per row.
-- =========================================================================
create table project_github (
  project_id uuid primary key references projects (id) on delete cascade,
  repo_owner text not null,
  repo_name text not null,
  default_branch text,
  gh_description text,
  homepage text,
  stars int not null default 0,
  forks int not null default 0,
  watchers int not null default 0,
  open_issues int not null default 0,
  topics text[] not null default '{}',
  license_spdx text,
  primary_language text,
  languages jsonb not null default '{}'::jsonb, -- {"TypeScript": 48211, ...}
  readme_md text,
  readme_html text,
  readme_etag text,
  repo_etag text,
  is_fork boolean not null default false,
  is_archived boolean not null default false,
  pushed_at timestamptz,
  repo_created_at timestamptz,
  last_synced_at timestamptz,
  sync_status text check (sync_status in ('ok', 'stale', 'error')),
  sync_error text,
  raw jsonb,
  unique (repo_owner, repo_name) -- re-pasting the same URL updates, not duplicates
);

-- =========================================================================
-- project_commits — feeds the terminal's `git log`.
-- =========================================================================
create table project_commits (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  sha text not null,
  short_sha text,
  message text,
  author_name text,
  author_login text,
  author_avatar_url text,
  authored_at timestamptz,
  html_url text,
  unique (project_id, sha)
);

create index project_commits_project_authored_idx
  on project_commits (project_id, authored_at desc);

-- =========================================================================
-- experience
-- =========================================================================
create table experience (
  id uuid primary key default gen_random_uuid(),
  org text not null,
  role text not null,
  employment_type text check (
    employment_type in ('full-time', 'contract', 'freelance', 'internship')
  ),
  location text,
  start_date date not null,
  end_date date, -- null = current
  is_current boolean generated always as (end_date is null) stored,
  summary_md text,
  highlights text[] not null default '{}',
  tech text[] not null default '{}',
  org_url text,
  org_logo_url text,
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger experience_moddatetime
  before update on experience
  for each row execute procedure extensions.moddatetime(updated_at);

create index experience_status_sort_idx on experience (status, sort_order);

-- =========================================================================
-- education — same shape as experience; the resume parser produces this too.
-- =========================================================================
create table education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  credential text, -- e.g. "B.S. Computer Science"
  field_of_study text,
  location text,
  start_date date,
  end_date date,
  is_current boolean generated always as (end_date is null) stored,
  summary_md text,
  highlights text[] not null default '{}',
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger education_moddatetime
  before update on education
  for each row execute procedure extensions.moddatetime(updated_at);

create index education_status_sort_idx on education (status, sort_order);

-- =========================================================================
-- skills — unique(lower(name)) stops the resume parser creating both
-- "React" and "react".
-- =========================================================================
create table skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text check (category in ('language', 'framework', 'tool', 'platform', 'practice')),
  proficiency smallint check (proficiency between 1 and 5),
  years_experience numeric,
  featured boolean not null default false,
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger skills_moddatetime
  before update on skills
  for each row execute procedure extensions.moddatetime(updated_at);

create unique index skills_lower_name_idx on skills (lower(name));
create index skills_status_sort_idx on skills (status, sort_order);

-- =========================================================================
-- faqs
-- =========================================================================
create table faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer_md text,
  answer_html text,
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger faqs_moddatetime
  before update on faqs
  for each row execute procedure extensions.moddatetime(updated_at);

create index faqs_status_sort_idx on faqs (status, sort_order);

-- =========================================================================
-- resume_uploads
-- =========================================================================
create table resume_uploads (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  original_filename text,
  file_size int,
  sha256 text unique, -- dedupes re-uploads of the same file
  page_count int,
  extracted_text text,
  extraction_method text check (extraction_method in ('unpdf', 'provider_native')),
  extraction_ms int,
  status text not null default 'uploaded' check (
    status in ('uploaded', 'extracting', 'extracted', 'parsing', 'parsed', 'failed')
  ),
  error text,
  uploaded_at timestamptz not null default now()
);

-- =========================================================================
-- ingest_jobs — one row per ingest run, GitHub or resume.
-- =========================================================================
create table ingest_jobs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('github_repo', 'resume_pdf')),
  source_ref text, -- repo URL or resume_uploads.id
  status text not null default 'queued' check (
    status in ('queued', 'running', 'needs_review', 'applied', 'failed', 'cancelled')
  ),
  winning_provider text,
  winning_model text,
  attempts jsonb not null default '[]'::jsonb, -- [{provider, model, ok, errorKind, status, latencyMs, at}]
  total_ms int,
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger ingest_jobs_moddatetime
  before update on ingest_jobs
  for each row execute procedure extensions.moddatetime(updated_at);

-- =========================================================================
-- staging_records — the review/diff mechanism. Nothing from a resume parse
-- publishes without a row here being explicitly accepted and applied.
-- =========================================================================
create table staging_records (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references ingest_jobs (id) on delete cascade,
  target_table text not null check (
    target_table in ('projects', 'experience', 'education', 'skills', 'profile')
  ),
  target_id uuid, -- null => proposed insert; set => proposed update
  operation text not null check (operation in ('insert', 'update')),
  proposed jsonb not null, -- already normalized to target_table's column shape
  current_snapshot jsonb, -- captured at review time, for a 3-way diff
  field_decisions jsonb not null default '{}'::jsonb, -- {"role": "accept", "summary_md": "reject"}
  edited jsonb, -- user's hand-edits; wins over `proposed`
  confidence numeric check (confidence between 0 and 1),
  source_quote text, -- verbatim resume span that produced this record
  dedupe_key text, -- e.g. lower(org)||'|'||lower(role)
  status text not null default 'pending' check (
    status in ('pending', 'accepted', 'rejected', 'applied', 'superseded')
  ),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index staging_records_job_idx on staging_records (job_id);
create index staging_records_status_idx on staging_records (status);
