begin;
create table if not exists public.ask_outs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  slug text not null unique check(length(slug) between 3 and 64 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  recipient_name text not null default '' check(length(recipient_name)<=80),
  recipient_tag text not null default '' check(length(recipient_tag)<=50),
  creator_name text not null default '' check(length(creator_name)<=80),
  opening_message text not null default '' check(length(opening_message)<=240),
  theme text not null default 'tagged-message' check(theme in ('tagged-message','cat-investigation','magical-message','scrapbook','tiny-exhibit')),
  selected_interests jsonb not null default '[]' check(jsonb_typeof(selected_interests)='array'),
  date date, weekday text not null default '', pickup_time time, end_time time,
  pickup_location text not null default '', destination text not null default '', map_data jsonb not null default '{}',
  activity text not null default '', additional_details jsonb not null default '{}', configuration jsonb not null default '{}',
  status text not null default 'draft' check(status in ('draft','published')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(id,user_id)
);
create index if not exists ask_outs_user_idx on public.ask_outs(user_id,updated_at desc);
create index if not exists ask_outs_slug_public_idx on public.ask_outs(slug) where status='published';
create table if not exists public.ask_out_responses (
  id bigint generated always as identity primary key,
  ask_out_id uuid not null references public.ask_outs(id) on delete cascade,
  response text not null check(response in ('viewed','started','tell_more','accepted','declined')),
  selected_day_option text, selected_activity text,
  session_hash text not null,
  responded_at timestamptz not null default now(),
  unique(ask_out_id,response,session_hash)
);
create index if not exists ask_out_responses_summary_idx on public.ask_out_responses(ask_out_id,response,responded_at desc);
alter table public.ask_outs enable row level security;
alter table public.ask_out_responses enable row level security;
revoke all on public.ask_outs,public.ask_out_responses from anon,authenticated;
revoke all on sequence public.ask_out_responses_id_seq from anon,authenticated;
commit;
