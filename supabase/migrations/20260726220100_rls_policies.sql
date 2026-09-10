-- RLS policies. Enabled on EVERY table, no exceptions — an un-RLS'd table
-- with the anon key is a public table.

-- =========================================================================
-- is_admin() — security definer is required, or the policy's own read of
-- admin_allowlist recurses through RLS.
-- =========================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_allowlist where user_id = auth.uid());
$$;

-- =========================================================================
-- Public content tables: anon/authenticated read published rows only;
-- admin (is_admin()) gets full read/write.
-- =========================================================================
alter table profile enable row level security;
create policy "anon reads profile" on profile
  for select to anon, authenticated using (true); -- singleton, always public
create policy "admin full access to profile" on profile
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table projects enable row level security;
create policy "anon reads published projects" on projects
  for select to anon, authenticated using (status = 'published');
create policy "admin full access to projects" on projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table experience enable row level security;
create policy "anon reads published experience" on experience
  for select to anon, authenticated using (status = 'published');
create policy "admin full access to experience" on experience
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table education enable row level security;
create policy "anon reads published education" on education
  for select to anon, authenticated using (status = 'published');
create policy "admin full access to education" on education
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table skills enable row level security;
create policy "anon reads published skills" on skills
  for select to anon, authenticated using (status = 'published');
create policy "admin full access to skills" on skills
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table faqs enable row level security;
create policy "anon reads published faqs" on faqs
  for select to anon, authenticated using (status = 'published');
create policy "admin full access to faqs" on faqs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =========================================================================
-- Child tables with no status of their own: gate on the parent project's
-- status instead.
-- =========================================================================
alter table project_github enable row level security;
create policy "anon reads github data for published projects" on project_github
  for select to anon, authenticated using (
    exists (
      select 1 from projects p
      where p.id = project_github.project_id and p.status = 'published'
    )
  );
create policy "admin full access to project_github" on project_github
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table project_commits enable row level security;
create policy "anon reads commits for published projects" on project_commits
  for select to anon, authenticated using (
    exists (
      select 1 from projects p
      where p.id = project_commits.project_id and p.status = 'published'
    )
  );
create policy "admin full access to project_commits" on project_commits
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =========================================================================
-- Private tables: admin policy only. With RLS enabled and no anon policy,
-- anon gets zero rows — that's the correct default; no deny policy needed.
-- =========================================================================
alter table admin_allowlist enable row level security;
create policy "admin reads allowlist" on admin_allowlist
  for select to authenticated using (public.is_admin());

alter table resume_uploads enable row level security;
create policy "admin full access to resume_uploads" on resume_uploads
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table ingest_jobs enable row level security;
create policy "admin full access to ingest_jobs" on ingest_jobs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table staging_records enable row level security;
create policy "admin full access to staging_records" on staging_records
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =========================================================================
-- Storage buckets.
-- `resumes`: private. Public download is a signed URL minted server-side,
-- or a copy published into `public-assets` on approval — never a public
-- link into the raw upload bucket.
-- `public-assets`: public read (project covers, avatar), admin write.
-- =========================================================================
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

create policy "admin full access to resumes bucket" on storage.objects
  for all to authenticated
  using (bucket_id = 'resumes' and public.is_admin())
  with check (bucket_id = 'resumes' and public.is_admin());

create policy "anon reads public-assets bucket" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'public-assets');

create policy "admin writes public-assets bucket" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'public-assets' and public.is_admin());

create policy "admin updates public-assets bucket" on storage.objects
  for update to authenticated
  using (bucket_id = 'public-assets' and public.is_admin())
  with check (bucket_id = 'public-assets' and public.is_admin());

create policy "admin deletes public-assets bucket" on storage.objects
  for delete to authenticated
  using (bucket_id = 'public-assets' and public.is_admin());
