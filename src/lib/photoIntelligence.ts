import type { BirthdayProject, LifeStage, PhotoAnalysis, PhotoAsset } from "./types";

export const LIFE_STAGES: Record<LifeStage,string> = {childhood:"Childhood",teen:"Teen years",young_adult:"Growing up",adult:"More recent",unknown:"Not sure"};
export const STAGE_CONFIDENCE = .7;
export function photoStage(photo: PhotoAsset): LifeStage {
  return photo.lifeStage ?? ((photo.analysis?.confidence ?? 0)>=STAGE_CONFIDENCE ? photo.analysis?.stage ?? "unknown" : "unknown");
}
export function chronologicalPhotos(photos: readonly PhotoAsset[]) {
  const stages=Object.keys(LIFE_STAGES);
  return [...photos].sort((a,b)=>stages.indexOf(photoStage(a))-stages.indexOf(photoStage(b)) || (a.dateTaken&&b.dateTaken?a.dateTaken.localeCompare(b.dateTaken):0) || a.order-b.order);
}

/** Project-local metadata only. No identity, embeddings, exact visual age or outside photos. */
export function analyzePhoto(photo: PhotoAsset, project: Pick<BirthdayProject,"age"|"birthdayDate">): PhotoAnalysis {
  const aspectRatio=photo.height>0?photo.width/photo.height:1;
  const qualityHints:string[]=[];
  if(Math.min(photo.width,photo.height)<400)qualityHints.push("Small original; best in a compact frame");
  if(aspectRatio>2.5)qualityHints.push("Wide image; full view recommended");
  const result:PhotoAnalysis={...photo.analysis,aspectRatio,stage:"unknown",confidence:0,source:"unknown",qualityHints,
    layoutSuitability:photo.analysis?.isGroupPhoto?["group-shot","contain"]:aspectRatio>1.25?["landscape","background-safe"]:aspectRatio<.85?["portrait","hero"]:["detail","square"]};
  // An ambiguous group never establishes which person the date describes.
  if(photo.analysis?.isGroupPhoto || !photo.dateTaken || !project.birthdayDate || !project.age)return result;
  const captured=Date.parse(photo.dateTaken);const birthday=Date.parse(project.birthdayDate);
  if(!Number.isFinite(captured)||!Number.isFinite(birthday)||captured>birthday)return result;
  const yearsBefore=(birthday-captured)/(365.2425*86400000);const approximate=project.age-yearsBefore;
  if(approximate<0||approximate>120)return result;
  // Conservative broad bins. Near boundaries remain uncertain, never forced.
  if([13,18,26].some(boundary=>Math.abs(approximate-boundary)<1))return result;
  return {...result,stage:approximate<13?"childhood":approximate<18?"teen":approximate<26?"young_adult":"adult",confidence:.78,source:"capture-date"};
}

/** Optional adapter boundary: an unavailable model can never block creation. */
export async function suggestPhoto(photo:PhotoAsset,project:Pick<BirthdayProject,"age"|"birthdayDate">,visual?: (photo:PhotoAsset)=>Promise<PhotoAnalysis>):Promise<PhotoAnalysis> {
  const metadata=analyzePhoto(photo,project);
  if(metadata.source==="capture-date"||!visual||photo.analysis?.isGroupPhoto)return metadata;
  try {
    const suggestion=await Promise.race([visual(photo),new Promise<null>(resolve=>setTimeout(()=>resolve(null),2500))]);
    if(!suggestion || suggestion.isGroupPhoto || !Object.hasOwn(LIFE_STAGES,suggestion.stage??"") || !Number.isFinite(suggestion.confidence) || suggestion.confidence!<STAGE_CONFIDENCE)return metadata;
    return {...metadata,...suggestion,confidence:Math.min(1,suggestion.confidence!),source:"visual-suggestion"};
  }catch{return metadata;}
}

/** Bounded EXIF date reader. Ignores GPS/identity tags and never sends bytes off-device. */
export async function captureDate(file:Blob):Promise<string|undefined> {
  try {
    const bytes=new Uint8Array(await file.slice(0,256*1024).arrayBuffer());
    // DateTimeOriginal is an ASCII EXIF value; accept only dates within an EXIF segment.
    if(bytes[0]!==0xff||bytes[1]!==0xd8)return;
    const view=new DataView(bytes.buffer);let p=2;
    while(p+4<bytes.length){if(bytes[p]!==0xff)break;const marker=bytes[p+1];if(marker===0xda||marker===0xd9)break;const length=view.getUint16(p+2);if(length<2||p+2+length>bytes.length)break;
      if(marker===0xe1&&new TextDecoder().decode(bytes.slice(p+4,p+10))==="Exif\0\0"){
        const base=p+10;const little=view.getUint16(base)===0x4949;const u16=(o:number)=>view.getUint16(o,little);const u32=(o:number)=>view.getUint32(o,little);
        const scan=(offset:number,depth:number):string|undefined=>{if(depth>1||offset<base||offset+2>p+2+length)return;const count=Math.min(u16(offset),200);for(let i=0;i<count;i++){const at=offset+2+i*12;if(at+12>p+2+length)break;const tag=u16(at);if(tag===0x8769){const found=scan(base+u32(at+8),depth+1);if(found)return found;}if(tag===0x9003&&u16(at+2)===2&&u32(at+4)>=19){const start=base+u32(at+8);if(start<base||start+19>p+2+length)return;const date=new TextDecoder().decode(bytes.slice(start,start+10)).replaceAll(":","-");if(/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(date)))return date;}}};return scan(base+u32(base+4),0);
      }p+=2+length;
    }
  }catch{return;}
}
