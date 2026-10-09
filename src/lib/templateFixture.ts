import { createEmptyProject, type BirthdayProject, type TemplateId, type VibeId } from "./types";
import { MEMORY_QUESTIONS } from "./questions";

/** Invented local QA data. Never uses a creator's project or database. */
export function templateFixture(templateId: TemplateId, count = 12, variant = "normal", vibe = "old-soul"): BirthdayProject {
  const project = createEmptyProject();
  const dimensions = [[1080,1920],[4032,3024],[1200,1200],[3000,600],[640,900],[160,120],[4000,6000]];
  const photographic = [
    ['photo-1517841905240-472988babdf9',1000,1500],
    ['photo-1529156069898-49953e39b3ac',1500,1000],
    ['photo-1534528741775-53994a69daeb',1000,1500],
    ['photo-1500530855697-b586d89ba3ee',1500,1000],
  ] as const;
  const answers = ["Always finding the extraordinary in ordinary days.","Curious · loyal · wonderfully funny","Long drives, extra garlic, rainy afternoons and the people around this table.","Goa, just before the monsoon","Dreams — Fleetwood Mac","The Grand Budapest Hotel","We still call that disastrous detour the scenic route.","Five more minutes.","Learning to make the perfect espresso","Making everybody feel like they belong","That unplanned train journey, the missed stop, and a sunrise we never would have seen otherwise.","Happy birthday. Thank you for the small kindnesses, the enormous laughs, and the way you make an ordinary day feel worth remembering. Here is to all the versions of you, and everything still ahead.","Here’s to the next chapter, together."];
  const fixture: BirthdayProject = { ...project, id: "template-qa", templateId, person: { fullName: variant === "long" ? "Alexandriatheodora Chandrasekhar Mukhopadhyay" : "Amara Rao", nickname: variant === "short" ? "A" : undefined, pronouns: "she/her", gender: "female", relationship: "best-friend" }, age: 25, birthdayDate: "2026-08-01", paletteId: "warm-editorial", vibes: { vibes: [vibe as VibeId], customVibe: "A little nostalgic, always curious." }, interests: ["Formula 1","Gaming","Movies","Books","Travel","Photography","Coffee"].map((label,i) => ({id:`interest-${i}`,label,custom:false})), memories: variant === "empty" ? [] : MEMORY_QUESTIONS.map((q,i) => ({id:q.key,key:q.key,answer: variant === "long" && [0,6,10,11,12].includes(i) ? (answers[i]+" ").repeat(i===11 ? 8 : 3).trim() : answers[i],skipped:false})), customMemories: variant === "empty" ? [] : Array.from({length: variant === "long" ? 10 : 2},(_,i) => ({id:`custom-${i}`,label:`Remember when ${i+1}`,value:"The little moments that became our favourite stories.",icon:"✦",prominence:i===0 ? "prominent" : "normal"})), photos: Array.from({length:Math.max(0,Math.min(75,count))},(_,i)=>{const sample=photographic[i%photographic.length];const [width,height]=variant==="photographic" ? [sample[1],sample[2]] : dimensions[i%dimensions.length];return {id:`qa-photo-${i}`,fileName:`memory-${i+1}.jpg`,previewUrl:variant==="photographic" ? `https://images.unsplash.com/${sample[0]}?auto=format&w=1000&q=85` : `/qa/templates/image?shape=${i%7}&n=${i}`,width,height,orientation:width===height?"square":width>height?"landscape":"portrait",focalPoint:{x:.5,y:.35},fit:"fill",heroEligible:true,isHero:i===0,order:i,caption:`Memory ${i+1} · a day worth keeping`,location:i%3===0?"Goa":undefined,dateTaken:i%4===0?`20${String(10+i%15).padStart(2,"0")}-06-01`:undefined};}) };
  if(variant==='context'||variant==='legacy')fixture.memories=fixture.memories.map((memory,i)=>({...memory,answer:i===11 ? ('  '+memory.key+' — 🥹✨\n“Always!”\n'+('A memory worth keeping. '.repeat(20))+'  ') : ('  '+memory.key+' — 🥹✨\n“Always!”\n  '),skipped:[5,8].includes(i)}));
  if(variant==='legacy')fixture.memories=fixture.memories.map(memory=>{const copy={...memory};delete (copy as {key?:string}).key;return copy;});
  return fixture;

}
