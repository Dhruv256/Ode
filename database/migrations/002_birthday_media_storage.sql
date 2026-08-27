-- Recipient pages need permanent URLs, so this bucket is deliberately public.
-- Uploads are only signed by the server route; do not add anonymous insert rules.
insert into storage.buckets (id, name, public, file_size_limit)
values ('birthday-media', 'birthday-media', true, 52428800)
on conflict (id) do update set public = true, file_size_limit = 52428800;
