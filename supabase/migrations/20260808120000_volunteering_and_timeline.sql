-- Volunteering and part-time roles live in `experience` — same shape as any
-- other role (org, role, dates, summary, highlights, tech), distinguished
-- only by employment_type. No new table; the landing-page timeline (see
-- lib/site/timeline.ts) discriminates on this column.
--
-- The original column-level check in 20260726220000_initial_schema.sql had
-- no explicit constraint name, so Postgres assigned the default
-- "<table>_<column>_check" — drop-if-exists then re-add is safe either way:
-- if the name guess is wrong, the add below fails loudly (duplicate/legacy
-- constraint still restricting values) rather than silently doing nothing.
alter table experience drop constraint if exists experience_employment_type_check;
alter table experience add constraint experience_employment_type_check
  check (employment_type in (
    'full-time', 'part-time', 'contract', 'freelance', 'internship', 'volunteer'
  ));

-- The landing-page timeline (and the admin experience/education lists, once
-- fixed to match) order by real dates rather than sort_order.
create index if not exists experience_status_start_idx
  on experience (status, start_date desc);
create index if not exists education_status_start_idx
  on education (status, start_date desc);
