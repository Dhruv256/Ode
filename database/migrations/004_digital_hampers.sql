begin;
create table public.digital_hampers (
  id uuid primary key default gen_random_uuid(), owner_id text not null,
  recipient text not null default '' check(length(recipient)<=80), sender text not null default '' check(length(sender)<=80),
  message text not null default '' check(length(message)<=500),
  theme text not null default 'soft-parcel' check(theme in ('soft-parcel','berry-letter','buttercup-picnic','cloud-ribbon')),
  opening_style text not null default 'burst' check(opening_style in ('burst','scene')),
  status text not null default 'draft' check(status in ('draft','published')),
  pin_hash text, access_version uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(id,owner_id)
);
create index digital_hampers_owner_idx on public.digital_hampers(owner_id,updated_at desc);
create table public.hamper_assets (
  id uuid primary key default gen_random_uuid(), hamper_id uuid not null, owner_id text not null,
  item_id uuid not null, path text not null unique, kind text not null check(kind in ('photo','voice')),
  mime text not null, asset_bytes bigint not null check(asset_bytes>0 and asset_bytes<=5242880),
  state text not null default 'pending' check(state in ('pending','ready')),
  created_at timestamptz not null default now(),
  foreign key(hamper_id,owner_id) references public.digital_hampers(id,owner_id) on delete cascade,
  check(kind <> 'voice' or asset_bytes<=2097152)
);
create table public.hamper_items (
  id uuid primary key, hamper_id uuid not null references public.digital_hampers on delete cascade,
  type text not null check(type in ('note','photo','song','video','voice','drawing','gift','location','coupon','news')),
  position integer not null check(position between 0 and 29), payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=262144),
  asset_bytes bigint not null default 0 check(asset_bytes between 0 and 5242880),
  unique(hamper_id,position) deferrable initially deferred
);
create index hamper_items_hamper_idx on public.hamper_items(hamper_id);
create table public.hamper_share_links (
  id uuid primary key default gen_random_uuid(), hamper_id uuid not null references public.digital_hampers on delete cascade,
  slug text not null unique check(length(slug) between 3 and 48 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and slug not in ('admin','api','dashboard','create','login','sign-in','sign-up','settings','hamper','website','www','new','edit')),
  is_primary boolean not null default false, revoked_at timestamptz, created_at timestamptz not null default now()
);
create unique index hamper_one_primary_idx on public.hamper_share_links(hamper_id) where is_primary and revoked_at is null;
create index hamper_links_hamper_idx on public.hamper_share_links(hamper_id);
create table public.hamper_events (
  id bigint generated always as identity primary key, hamper_id uuid not null references public.digital_hampers on delete cascade,
  link_id uuid not null references public.hamper_share_links on delete cascade,
  item_id uuid references public.hamper_items on delete cascade,
  event_type text not null check(event_type in ('hamper_viewed','pin_unlocked','box_first_shake','box_second_shake','box_opened','item_opened','external_link_clicked')),
  session_hash text not null, dedupe_key text not null unique, created_at timestamptz not null default now()
);
create index hamper_events_summary_idx on public.hamper_events(hamper_id,event_type,created_at desc);
create table public.hamper_access_attempts (
  key text primary key, attempts integer not null default 0, expires_at timestamptz not null
);
create index hamper_attempts_expiry_idx on public.hamper_access_attempts(expires_at);
-- Durable cleanup queue: deleting rows records the exact server-generated path
-- in the same transaction. Storage failures can be retried without losing work.
create table public.hamper_storage_cleanup (
  path text primary key, created_at timestamptz not null default now(), run_after timestamptz not null default now()
);
create function public.hamper_queue_asset_cleanup() returns trigger language plpgsql set search_path=public as $$
begin insert into hamper_storage_cleanup(path,run_after) values(old.path,greatest(now(),old.created_at+interval '3 hours')) on conflict do nothing; return old; end $$;
create trigger hamper_asset_cleanup after delete on public.hamper_assets for each row execute function public.hamper_queue_asset_cleanup();

-- Lock the owner for concurrent creates/uploads and enforce quotas in the DB.
create function public.hamper_quota_guard() returns trigger language plpgsql set search_path=public as $$
declare used bigint; owner text; parent uuid;
begin
  if TG_TABLE_NAME='digital_hampers' then
    perform pg_advisory_xact_lock(hashtextextended(new.owner_id,0));
    if (select count(*) from digital_hampers where owner_id=new.owner_id and id<>new.id)>=10 then
      raise exception 'At most 10 active hampers' using errcode='23514'; end if;
  elsif TG_TABLE_NAME='hamper_assets' then
    perform pg_advisory_xact_lock(hashtextextended(new.owner_id,0));
    select coalesce(sum(asset_bytes),0) into used from hamper_assets where owner_id=new.owner_id and id<>new.id;
    if used+new.asset_bytes>209715200 then raise exception 'User storage cap' using errcode='23514'; end if;
    select coalesce(sum(asset_bytes),0) into used from hamper_assets where hamper_id=new.hamper_id and id<>new.id;
    if used+new.asset_bytes>26214400 then raise exception 'Hamper storage cap' using errcode='23514'; end if;
  else
    perform 1 from digital_hampers where id=new.hamper_id for update;
    if (select count(*) from hamper_items where hamper_id=new.hamper_id and id<>new.id)>=30 then raise exception 'Item cap' using errcode='23514'; end if;
    if (select count(*) from hamper_items where hamper_id=new.hamper_id and type=new.type and id<>new.id)>=(case when new.type in ('photo','note') then 10 else 5 end) then raise exception 'Item type cap' using errcode='23514'; end if;
    if new.type in ('photo','voice') then
      if not exists(select 1 from hamper_assets where id::text=new.payload->>'assetId' and hamper_id=new.hamper_id and item_id=new.id and kind=new.type and state='ready' and asset_bytes=new.asset_bytes) then
        raise exception 'Asset ownership or bytes mismatch' using errcode='23514'; end if;
    elsif new.asset_bytes<>0 then raise exception 'Unexpected asset bytes' using errcode='23514'; end if;
  end if;
  return new;
end $$;
create trigger hamper_count before insert on public.digital_hampers for each row execute function public.hamper_quota_guard();
create trigger hamper_asset_quota before insert or update on public.hamper_assets for each row execute function public.hamper_quota_guard();
create trigger hamper_item_quota before insert or update on public.hamper_items for each row execute function public.hamper_quota_guard();

-- This app uses Clerk + server PostgreSQL, not Supabase Auth. The owner guard
-- lives in the server layer; no browser role can bypass it via PostgREST.
alter table public.digital_hampers enable row level security;
alter table public.hamper_items enable row level security;
alter table public.hamper_assets enable row level security;
alter table public.hamper_share_links enable row level security;
alter table public.hamper_events enable row level security;
alter table public.hamper_access_attempts enable row level security;
alter table public.hamper_storage_cleanup enable row level security;
revoke all on public.digital_hampers,public.hamper_items,public.hamper_assets,public.hamper_share_links,public.hamper_events,public.hamper_access_attempts,public.hamper_storage_cleanup from anon,authenticated;
revoke all on sequence public.hamper_events_id_seq from anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('ode-hamper-assets','ode-hamper-assets',false,5242880,array['image/jpeg','image/png','image/webp','audio/mpeg','audio/mp4','audio/ogg','audio/webm','audio/wav','audio/x-wav'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
-- A restrictive policy also protects this bucket if another feature has a
-- broad permissive storage policy. Service-role signing bypasses this policy.
create policy hamper_bucket_server_only on storage.objects as restrictive
  for all to anon, authenticated
  using(bucket_id <> 'ode-hamper-assets') with check(bucket_id <> 'ode-hamper-assets');
commit;
