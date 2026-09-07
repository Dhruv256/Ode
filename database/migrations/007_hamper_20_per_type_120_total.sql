-- Upgrade existing Digital Hamper installs to 20 items per type and 120 total.
-- The existing position constraint and quota function are replaced in place;
-- no competing trigger is created and no existing hamper rows are rewritten.
begin;
select pg_advisory_xact_lock(hashtextextended('ode:digital-hampers-migration',0));
set local lock_timeout='10s';

alter table public.hamper_items drop constraint if exists hamper_items_position_check;
alter table public.hamper_items add constraint hamper_items_position_check check(position between 0 and 119);

create or replace function public.hamper_quota_guard() returns trigger language plpgsql set search_path=public as $$
declare used bigint;
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
    if (select count(*) from hamper_items where hamper_id=new.hamper_id and id<>new.id)>=120 then raise exception 'Hamper item limit of 120 reached' using errcode='23514',constraint='hamper_items_total_cap'; end if;
    if (select count(*) from hamper_items where hamper_id=new.hamper_id and type=new.type and id<>new.id)>=20 then raise exception 'Per-category item limit of 20 reached' using errcode='23514',constraint='hamper_items_type_cap'; end if;
    if new.type in ('photo','voice') then
      if not exists(select 1 from hamper_assets where id::text=new.payload->>'assetId' and hamper_id=new.hamper_id and item_id=new.id and kind=new.type and state='ready' and asset_bytes=new.asset_bytes) then
        raise exception 'Asset ownership or bytes mismatch' using errcode='23514'; end if;
    elsif new.asset_bytes<>0 then raise exception 'Unexpected asset bytes' using errcode='23514'; end if;
  end if;
  return new;
end $$;
commit;
