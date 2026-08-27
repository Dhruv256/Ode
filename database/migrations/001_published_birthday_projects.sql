create table if not exists public.birthday_projects (
  slug text primary key check (slug ~ '^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$'),
  project jsonb not null,
  write_token text not null,
  visibility text not null check (visibility in ('private', 'link', 'public')),
  status text not null check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists birthday_projects_live_slug_idx
  on public.birthday_projects (slug)
  where status = 'published' and visibility <> 'private';
