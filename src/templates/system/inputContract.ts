import type { BirthdayProject, MemoryKey, TemplateId, PhotoAsset } from "@/lib/types";
import { MEMORY_QUESTIONS } from "@/lib/questions";
import { personalAnswers } from '@/lib/personalization';
import { allocatePhotoStory } from './roles';

export interface TemplateInputUsageContract {
  identity: string; vibe: readonly string[]; interests: string; memories: Record<MemoryKey,string>;
  customMemories: string; photos: readonly string[]; publishing: readonly string[]; soundtrack: string;
}
const scenes:Record<TemplateId,string>={"contact-sheet":"darkroom annotations","cut-and-paste":"scrapbook notes","cover-star":"editorial profile",cinema:"personal credits","internet-person":"personal files",archive:"catalogue annotations","after-dark":"night notes","sunday-morning":"table postcards","polaroid-wall":"pinned notes",dreamscape:"memory constellation","poster-city":"street notices",yearbook:"signed margins"};
export const INPUT_CONTRACTS = Object.fromEntries(Object.entries(scenes).map(([id,scene])=>[id,{
  identity:`${scene}: dedication, full name, nickname, pronouns, relationship, birthday date and age`,
  vibe:["motion pace","spacing density","accent typography","photo frames","section separators","interaction feedback","dedication copy"],
  interests:`${scene}: one labelled narrative motif for every selected interest`,
  memories:Object.fromEntries(MEMORY_QUESTIONS.map(q=>[q.key,q.key==="ending-line"?"final scene":q.key==="birthday-message"?"birthday letter":scene])),
  customMemories:`${scene}: label, value, mark and prominence`,
  photos:["hero selection","ordered collection","fixed display frames","focal position","fit","caption","location","date","optional stage"],
  publishing:["public URL","publication status","visibility and indexing","unlock gate"],soundtrack:"recipient controls: source, volume, offset, fades and loop",
}])) as unknown as Record<TemplateId,TemplateInputUsageContract>;

export interface SuppliedInput { key:string; value:string; kind:"text"|"behavior" }
export function suppliedCreatorInputs(p:BirthdayProject):SuppliedInput[] {
  const result:SuppliedInput[]=[];
  const add=(key:string,value:unknown,kind:SuppliedInput["kind"]="text")=>{if(value!==undefined&&value!==null&&String(value).trim())result.push({key,value:String(value),kind});};
  for(const key of ["fullName","nickname","pronouns","relationship","gender"] as const)add(`person.${key}`,p.person[key],key==="relationship"||key==="gender"?"behavior":"text");
  add("age",p.age,"behavior");add("birthdayDate",p.birthdayDate,"behavior");add("templateId",p.templateId,"behavior");add("paletteId",p.paletteId,"behavior");
  if(p.paletteId==="custom")add("customPalette",p.customPalette?.join(","),"behavior");
  for(const vibe of p.vibes.vibes)add(`vibe.${vibe}`,vibe,"behavior");add("customVibe",p.vibes.customVibe);
  for(const interest of p.interests)add(`interest.${interest.id}`,interest.label);
  for(const memory of p.memories)if(!memory.skipped)add(`memory.${memory.key}`,memory.answer);
  for(const memory of p.customMemories??[])for(const key of ["label","value","icon","prominence"] as const)add(`custom.${memory.id}.${key}`,memory[key],key==="prominence"?"behavior":"text");
  add("photoMode",p.photoMode,"behavior");
  for(const photo of p.photos){add(`photo.${photo.id}`,photo.id,"behavior");for(const key of ["caption","location","dateTaken","lifeStage"] as const)add(`photo.${photo.id}.${key}`,photo[key],key==="dateTaken"||key==="lifeStage"?"behavior":"text");}
  if(p.soundtrack)for(const key of ["previewUrl","volume","startAt","fadeIn","fadeOut","loop"] as const)add(`soundtrack.${key}`,p.soundtrack[key],"behavior");
  for(const key of ["slug","visibility","unlockAt","status"] as const)add(`publishing.${key}`,p.publishing[key],"behavior");
  return result;
}
export function validateCreatorInputs(provided:readonly SuppliedInput[],consumed:ReadonlySet<string>) {
  const unused=provided.filter(input=>!consumed.has(input.key));
  return {provided:provided.length,consumed:provided.length-unused.length,unused,valid:unused.length===0};
}

/** Inputs explicitly presented by the native story. OR-fallbacks are resolved, not assumed. */
export function nativeMemoryKeys(p:BirthdayProject,id:TemplateId,render?:{photos:PhotoAsset[];hero?:PhotoAsset;device?:string}):Set<MemoryKey>{
  const values=new Map(personalAnswers(p.memories).map(m=>[m.key,m.answer]));const used=new Set<MemoryKey>();
  const add=(...keys:MemoryKey[])=>keys.forEach(k=>used.add(k));
  const either=(...keys:MemoryKey[])=>{const first=keys.find(k=>values.has(k));if(first)used.add(first);};
  add("birthday-message","ending-line");
  if(!["after-dark","cut-and-paste","internet-person"].includes(id))add("one-sentence");
  // Permanent notes cover every remaining answer, including native conditional photo scenes.
  // Only unconditional, reachable text belongs here; photo-dependent branches are omitted.
  switch(id){
    case "contact-sheet": add("three-words","things-they-love","favorite-song");break;
    case "cut-and-paste":add("three-words","always-says","things-they-love","inside-joke","unforgettable-memory");either("current-obsession","favorite-song");break;
    case "cover-star":either("always-says","inside-joke");add("inside-joke","unforgettable-memory");break;
    case "cinema":either("always-says","inside-joke");add("favorite-song","unforgettable-memory");break;
    case "internet-person":add("favorite-song","favorite-movie","favorite-place","current-obsession","unforgettable-memory","inside-joke");break;
    case "archive":either("always-says","known-for");add("unforgettable-memory");break;
    case "after-dark":add("three-words","current-obsession","always-says","favorite-song","unforgettable-memory");either("inside-joke","known-for");break;
    case "sunday-morning":add("favorite-song","favorite-movie","favorite-place","things-they-love","inside-joke","unforgettable-memory");break;
    case "polaroid-wall":break;
    case "dreamscape":add("always-says","inside-joke");break;
    case "poster-city":add("three-words","favorite-song","favorite-movie","always-says","unforgettable-memory");either("things-they-love","current-obsession");break;
    case "yearbook":add("three-words","favorite-song","favorite-movie","favorite-place","current-obsession","things-they-love","unforgettable-memory","always-says","inside-joke","known-for");break;
  }
  const allocation=allocatePhotoStory(render?.photos??p.photos,render?.hero?.id);
  if(id==='contact-sheet'){
    if(allocation.hero){add('known-for');if(!allocation.hero.location)add('favorite-place');}
    if(allocation.pair.length>1)add('favorite-movie');
    if(allocation.reveal)either('inside-joke','current-obsession');
    either('unforgettable-memory','always-says');
  }
  if(id==='cut-and-paste'&&allocation.reveal)add('known-for');
  if(id==='cover-star'){
    if(allocation.feature){add('known-for');either('favorite-place','things-they-love');}
    if(render?.device==='desktop'&&[allocation.carousel,allocation.secondaryPair,allocation.montage].some(photos=>photos.length))add('three-words','favorite-song','favorite-movie','current-obsession');
  }
  if(id==='internet-person')either('unforgettable-memory','one-sentence');
  if(id==='archive'&&allocation.reveal&&!allocation.reveal.caption)add('inside-joke');
  if(id==='sunday-morning'&&allocation.feature)add('always-says');
  if(id==='dreamscape'&&[allocation.carousel,allocation.secondaryPair,allocation.montage].some(photos=>photos.length))add('three-words','current-obsession','favorite-song');
  return used;
}
