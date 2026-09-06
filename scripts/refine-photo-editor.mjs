import {readFile,writeFile}from'node:fs/promises';
const path='src/components/creator/steps/PhotosStep.tsx';let s=await readFile(path,'utf8');
s=s.replace('type="button" aria-expanded={confirmClear}','type="button" disabled={uploading} aria-expanded={confirmClear}');
s=s.replace('This can&apos;t be undone.','You can undo this before leaving this step.');
s=s.replace('      {/* Dropzone */}',`      {removed.length > 0 && <div role="status" className="mt-4 flex flex-wrap items-center gap-3 border border-line p-4"><p>{removed.length} photos removed.</p><button type="button" className="min-h-11 underline" onClick={async()=>{const restore=removed.filter(p=>!project.photos.some(existing=>existing.id===p.id));for(const photo of restore){if(photo.previewUrl.startsWith("blob:")){const blob=await fetch(photo.previewUrl).then(r=>r.blob());await saveLocalMedia(project.id,photo.id,blob);}}dispatch({type:"addPhotos",photos:restore.map((p,i)=>({...p,order:project.photos.length+i}))});setRemoved([]);}}>Undo clear all</button></div>}
      {/* Dropzone */}`);
s=s.replace('onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}','aria-busy={uploading}\n        onKeyDown={(e) => {if(e.key === "Enter" || e.key === " "){e.preventDefault();inputRef.current?.click();}}}');
s=s.replace('Drop photos here</p>','{uploading ? "Saving originals…" : project.photos.length ? "Add more photos" : "Drop photos here"}</p>');
s=s.replace('      {/* Photo wall */}','      {project.photos.length > 0 && <PhotoOrganizer />}\n      {/* Photo wall */}');
s=s.replace('const rect = e.currentTarget.getBoundingClientRect();','const rect = (e.currentTarget.querySelector("img,video") ?? e.currentTarget).getBoundingClientRect();');
s=s.replace('group relative aspect-square w-full cursor-crosshair overflow-hidden border border-line bg-paper-deep','group relative w-full cursor-crosshair overflow-hidden border border-line bg-paper-deep');
s=s.replaceAll('h-full w-full select-none object-cover','aspect-square w-full select-none object-cover');
s=s.replace('absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-paper/20 bg-night/60 px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100','relative flex flex-wrap items-center justify-between border-t border-paper/20 bg-night px-1 py-1');
s=s.replace('grid h-6 w-6 place-items-center','grid h-11 w-11 place-items-center');
s=s.replace('onClick={() => dispatch({ type: "removePhoto", photoId: photo.id })}','onClick={() => {void removeLocalMedia(project.id,[photo.id]);dispatch({ type: "removePhoto", photoId: photo.id });}}');
s=s.replace('  const { dispatch } = useProject();','  const { project, dispatch } = useProject();');
s=s.replace('            value={photo.fit}','            aria-label="Photo crop mode"\n            value={photo.fit}');
s=s.replace('            value={photo.caption ?? ""}','            aria-label="Photo caption"\n            value={photo.caption ?? ""}');
s=s.replace('            value={photo.location ?? ""}','            aria-label="Photo location"\n            value={photo.location ?? ""}');
s=s.replace('            value={photo.dateTaken ?? ""}','            aria-label="Photo capture date"\n            value={photo.dateTaken ?? ""}');
s=s.replace('          <p className="font-mono text-[9px] uppercase tracking-widest2 text-ink-faint">\n            {photo.width}',`          {(["x","y"] as const).map(axis=><label key={axis} className="block text-xs">{axis==="x"?"Horizontal crop":"Vertical crop"}<input aria-label={axis==="x"?"Horizontal crop":"Vertical crop"} type="range" min="0" max="1" step="0.01" value={photo.focalPoint[axis]} onChange={e=>patch({focalPoint:{...photo.focalPoint,[axis]:Number(e.target.value)}})} className="block min-h-11 w-full" /></label>)}
          <label className="flex min-h-11 items-center gap-2 text-xs"><input type="checkbox" checked={photo.analysis?.isGroupPhoto??false} onChange={e=>patch({analysis:{...photo.analysis,isGroupPhoto:e.target.checked}})}/>Keep the whole group in view</label>
          <p className="font-mono text-[9px] uppercase tracking-widest2 text-ink-faint">
            {photo.width}`);
s=s.replace('  const img = new Image();','  const img = new Image();\n    const timeout=window.setTimeout(()=>resolve({width:0,height:0}),15000);');
s=s.replace('img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });','img.onload = () => {clearTimeout(timeout);resolve({ width: img.naturalWidth, height: img.naturalHeight });};');
s=s.replace('img.onerror = () => resolve({ width: 0, height: 0 });','img.onerror = () => {clearTimeout(timeout);resolve({ width: 0, height: 0 });};');
await writeFile(path,s);
