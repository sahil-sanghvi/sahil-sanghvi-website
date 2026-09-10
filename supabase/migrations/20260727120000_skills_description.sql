-- OPTIONS (skills) needs a description per flag; the original schema had no
-- field for it. Adding it here rather than editing the already-applied
-- initial migration.
alter table skills add column description text;
