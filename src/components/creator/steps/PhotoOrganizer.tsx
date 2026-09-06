"use client";
import { useState } from "react";
import { useProject } from "@/state/projectStore";
import { analyzePhoto, LIFE_STAGES, photoStage } from "@/lib/photoIntelligence";
import type { LifeStage } from "@/lib/types";

export function PhotoOrganizer(){
  const {project,dispatch}=useProject();const [selected,setSelected]=useState<string[]>([]);
  const assign=(ids:string[],stage:LifeStage)=>{for(const photoId of ids)dispatch({type:"patchPhoto",photoId,patch:{lifeStage:stage}});setSelected([]);};
  return <details className="mt-6 border border-line p-4">
    <summary className="min-h-11 cursor-pointer font-display text-xl">Organize the years <span className="font-sans text-sm text-ink-soft">· optional</span></summary>
    <p className="mt-2 max-w-xl text-sm text-ink-soft">Suggestions use photo dates and the birthday you entered. They can be wrong, especially in group photos. Leave anything uncertain in “Not sure,” or skip this entirely.</p>
    <div className="my-4 flex flex-wrap gap-3">
      <button type="button" className="min-h-11 border border-line px-3 text-sm" onClick={()=>project.photos.forEach(photo=>dispatch({type:"patchPhoto",photoId:photo.id,patch:{analysis:analyzePhoto(photo,project)}}))}>Suggest from dates</button>
      <button type="button" className="min-h-11 border border-line px-3 text-sm" onClick={()=>setSelected(selected.length===project.photos.length?[]:project.photos.map(p=>p.id))}>{selected.length===project.photos.length?"Deselect all":"Select all"}</button>
      <label className="flex min-h-11 items-center gap-2 text-sm">Move {selected.length} selected
        <select aria-label="Life stage for selected photos" disabled={!selected.length} value="" onChange={e=>assign(selected,e.target.value as LifeStage)} className="max-w-40 border border-line bg-paper p-2"><option value="" disabled>Choose stage</option>{Object.entries(LIFE_STAGES).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select>
      </label>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(LIFE_STAGES).map(([id,label])=><section key={id} className="min-w-0 border border-dashed border-line p-3" aria-label={label} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const photoId=e.dataTransfer.getData("text/ode-photo");if(project.photos.some(p=>p.id===photoId))assign([photoId],id as LifeStage);}}>
      <h3 className="font-display text-xl">{label}</h3>
      <ul className="mt-3 space-y-2">{project.photos.filter(p=>photoStage(p)===id).map(photo=><li key={photo.id} draggable onDragStart={e=>e.dataTransfer.setData("text/ode-photo",photo.id)} className="flex min-h-11 items-center gap-2 border border-line p-2">
        <input type="checkbox" aria-label={`Select ${photo.fileName}`} checked={selected.includes(photo.id)} onChange={e=>setSelected(e.target.checked?[...selected,photo.id]:selected.filter(key=>key!==photo.id))}/>
        <span className="min-w-0 break-words text-sm">{photo.fileName}<small className="block text-ink-soft">{photo.lifeStage?"Your selection":photo.analysis?.source==="capture-date"?`${Math.round((photo.analysis.confidence??0)*100)}% · date suggestion`:"No confident suggestion"}</small></span>
      </li>)}</ul>
    </section>)}</div>
  </details>;
}
