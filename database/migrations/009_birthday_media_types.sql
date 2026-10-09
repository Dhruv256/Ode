-- Restrict future birthday uploads; preserve existing objects and the existing
-- public birthday-media audience. Apply explicitly in staging before production.
update storage.buckets set allowed_mime_types = array[
  'image/jpeg','image/png','image/webp','image/gif','image/avif',
  'video/mp4','video/webm','video/quicktime',
  'audio/mpeg','audio/mp4','audio/wav','audio/x-wav','audio/webm','audio/ogg','audio/aac'
] where id = 'birthday-media';
