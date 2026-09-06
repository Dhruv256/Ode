"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { PhotoAsset } from "@/lib/types";
import { Photo } from "./photo";
import { LIFE_STAGES, photoStage } from "@/lib/photoIntelligence";

export function PhotoViewer({photo,onClose}:{photo:PhotoAsset;onClose:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const node=dialog.current;const previous=document.activeElement as HTMLElement|null;node?.showModal();const overflow=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{node?.close();document.body.style.overflow=overflow;previous?.focus();};},[]);
  return createPortal(<dialog ref={dialog} className="tp-photo-dialog" aria-label={photo.caption||"Full photo"} onKeyDown={event=>{
    if(event.key!=="Tab")return;
    const controls=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')).filter(node=>node.getClientRects().length);
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  }} onCancel={event=>{event.preventDefault();onClose();}} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
    <div><button type="button" autoFocus onClick={onClose} className="tp-viewer-close">Close photo ×</button>
      <Photo photo={photo} fit="contain" treatment="none" ratio="landscape" footprint="unbounded" className="tp-viewer-image" showCaption={false}/>
      <p>{photo.caption || "A moment worth keeping"}</p>
      <p className="tp-photo-meta">{[photo.location,photo.dateTaken,photoStage(photo)!=="unknown"?LIFE_STAGES[photoStage(photo)]:undefined].filter(Boolean).join(" · ")}</p>
    </div>
  </dialog>,document.body);
}
