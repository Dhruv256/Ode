-- Additive migration. No birthday row, slug, write token or media is removed.
begin;
alter table public.birthday_projects add column if not exists owner_id text;
alter table public.birthday_projects add column if not exists id text not null default gen_random_uuid()::text;
-- Reuse existing client project IDs where unambiguous. Keep the original JSON
-- untouched for legacy recovery; the owner API returns the canonical row ID.
update public.birthday_projects b set id = b.project->>'id'
where b.owner_id is null and length(b.project->>'id') between 1 and 100
  and (select count(*) from public.birthday_projects x where x.project->>'id' = b.project->>'id') = 1
  and not exists (select 1 from public.birthday_projects x where x.id = b.project->>'id' and x.slug <> b.slug);
create unique index if not exists birthday_projects_id_idx on public.birthday_projects(id);
create index if not exists birthday_projects_owner_idx on public.birthday_projects(owner_id, updated_at desc);
alter table public.birthday_projects enable row level security;
revoke all on public.birthday_projects from anon, authenticated;
-- Existing public pages already read through the server. Legacy ownership is
-- claimed ONLY by proving the existing write token in the authenticated API.
commit;
