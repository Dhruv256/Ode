"use client";
import { useEffect, useState, type RefObject } from "react";
import type { BirthdayProject, TemplateId } from "@/lib/types";
import { suppliedCreatorInputs, validateCreatorInputs } from "./inputContract";

/** Compares real rendered text/collection IDs with non-empty creator inputs. No production logs. */
export function InputUsageQa({project,templateId,root}:{project:BirthdayProject;templateId:TemplateId;root:RefObject<HTMLDivElement>}){
  const [report,setReport]=useState<ReturnType<typeof validateCreatorInputs>>();
  useEffect(()=>{
    if(process.env.NODE_ENV==="production")return;
    const node=root.current;if(!node)return;let timer:ReturnType<typeof setTimeout>;let lastWarning="";
    const check=()=>{
      const text=(node.textContent??"")+Array.from(node.querySelectorAll('[data-creator-values]')).map(n=>{try{return JSON.parse(n.getAttribute('data-creator-values')??'[]').join(' ');}catch{return '';}}).join(' ');
      const normalized=(s:string)=>s.toLowerCase().replace(/\s+/g,' ').trim();const content=normalized(text);
      const ids=new Set(Array.from(node.querySelectorAll('[data-photo-id]')).map(el=>el.getAttribute('data-photo-id')));
      const provided=suppliedCreatorInputs(project);const consumed=new Set<string>();
      for(const input of provided){
        if(input.kind==="text"&&content.includes(normalized(input.value)))consumed.add(input.key);
        if(input.key.startsWith('vibe.')&&node.dataset.vibes?.split(' ').includes(input.value))consumed.add(input.key);
        if(input.key.startsWith('photo.')){
          const photo=project.photos.find(p=>input.key===`photo.${p.id}`||input.key.startsWith(`photo.${p.id}.`));
          if(photo&&ids.has(photo.id)&&(input.kind==='behavior'||content.includes(normalized(input.value))))consumed.add(input.key);
        }
        if(input.kind==='behavior'&&['person.gender','person.relationship','age','birthdayDate','templateId','paletteId','customPalette','photoMode'].includes(input.key)&&node.querySelector('.tp-personal-notes'))consumed.add(input.key);
        if(input.key.startsWith('custom.')&&input.key.endsWith('.prominence')&&node.querySelector(`[data-prominence="${input.value}"]`))consumed.add(input.key);
        // These are consumed by the release route and the shared gate/audio player, not story copy.
        if(input.key.startsWith('publishing.'))consumed.add(input.key);
        if(input.key.startsWith('soundtrack.')&&node.querySelector('audio'))consumed.add(input.key);
      }
      const next=validateCreatorInputs(provided,consumed);setReport(previous=>JSON.stringify(previous)===JSON.stringify(next)?previous:next);
      node.dataset.inputUsageValid=String(next.valid);
      node.dataset.photoUsageValid=String(project.photos.every(p=>ids.has(p.id)));
      const warning=next.unused.map(i=>i.key).join(',');
      if(warning&&warning!==lastWarning)for(const input of next.unused)console.warn(`UNUSED CREATOR INPUT: ${input.key} = ${JSON.stringify(input.value)}; template = ${templateId}`);
      lastWarning=warning;
    };
    const schedule=()=>{clearTimeout(timer);timer=setTimeout(check,500);};
    const observer=new MutationObserver(schedule);observer.observe(node,{childList:true,subtree:true,characterData:true});schedule();
    return()=>{observer.disconnect();clearTimeout(timer);};
  },[project,templateId,root]);
  if(process.env.NODE_ENV==="production"||!report)return null;
  return <details className="tp-dev-qa" data-qa-panel><summary>Dev QA · {report.consumed}/{report.provided} inputs</summary><p>{report.valid?'All supplied inputs accounted for.':'Unused creator inputs:'}</p><ul>{report.unused.map(input=><li key={input.key}>{input.key}</li>)}</ul></details>;
}
