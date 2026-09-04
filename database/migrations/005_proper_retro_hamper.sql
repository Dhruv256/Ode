-- Additive: expands the allowed theme set without touching existing hampers.
begin;
alter table public.digital_hampers drop constraint if exists digital_hampers_theme_check;
alter table public.digital_hampers add constraint digital_hampers_theme_check
  check(theme in ('soft-parcel','berry-letter','buttercup-picnic','cloud-ribbon','proper-retro'));
commit;
