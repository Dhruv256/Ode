import { RequestError } from './serverAuth';

export const BIRTHDAY_MEDIA_TYPES = {
  image: ['image/jpeg','image/png','image/webp','image/gif','image/avif'],
  video: ['video/mp4','video/webm','video/quicktime'],
  audio: ['audio/mpeg','audio/mp4','audio/wav','audio/x-wav','audio/webm','audio/ogg','audio/aac'],
} as const;
export const BIRTHDAY_MEDIA_MAX_BYTES = 50 * 1024 * 1024;

export function validateBirthdayUpload(value: unknown) {
  const body=value as Record<string,unknown>;
  if(!body || typeof body!=='object') throw new RequestError('Incomplete media upload request.');
  for(const key of ['projectId','assetId','fileName'] as const) {
    if(typeof body[key]!=='string' || !body[key].trim() || body[key].length>(key==='fileName'?240:100)) throw new RequestError('Incomplete media upload request.');
  }
  if(!['image','video','audio'].includes(String(body.kind)) || typeof body.contentType!=='string') throw new RequestError('Choose a supported media file.',415);
  const kind=body.kind as keyof typeof BIRTHDAY_MEDIA_TYPES;
  const contentType=body.contentType.split(';')[0].trim().toLowerCase();
  if(!(BIRTHDAY_MEDIA_TYPES[kind] as readonly string[]).includes(contentType)) throw new RequestError('Choose a supported photo, video, or audio format. SVG and HTML files cannot be published.',415);
  if(typeof body.size!=='number' || !Number.isSafeInteger(body.size) || body.size<=0 || body.size>BIRTHDAY_MEDIA_MAX_BYTES) throw new RequestError('Choose a media file smaller than 50 MB.',413);
  return {projectId:body.projectId as string,assetId:body.assetId as string,fileName:body.fileName as string,contentType,kind};
}
