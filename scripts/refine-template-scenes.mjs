import ts from 'typescript';
import {readFile,writeFile} from 'node:fs/promises';
async function edit(id,change){const path=`src/templates/${id}/index.tsx`;await writeFile(path,change(await readFile(path,'utf8')));}
function removeScenes(text,match){const ast=ts.createSourceFile('x.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const spans=[];function visit(n){if(ts.isJsxElement(n)&&n.openingElement.tagName.getText(ast)==='Scene'&&match(n.getText(ast)))spans.push([n.getStart(ast),n.end]);else ts.forEachChild(n,visit);}visit(ast);for(const [a,b]of spans.sort((x,y)=>y[0]-x[0]))text=text.slice(0,a)+text.slice(b);return text;}
await edit('cinema',s=>{
 s=s.replace(/    <TitleCard[^\n]+\n/,'');
 s=removeScenes(s,t=>t.includes('the film resumes itself'));
 s=s.replace('    <PersonalizationSections ctx={ctx} />\n','');
 s=s.replace('    <Scene data-experience-chapter className="grid min-h-[44svh]','    <PersonalizationSections ctx={ctx} />\n    <Scene data-experience-chapter className="grid min-h-[44svh]');
 return s;
});
await edit('sunday-morning',s=>{
 s=removeScenes(s,t=>t.includes('stay here a moment'));
 s=s.replace('duration: 18, repeat: Infinity, repeatType: "mirror"','duration: MOTION.hero, repeat: 0, repeatType: "mirror"');
 s=s.replace('x: ["-30%", "180%"]','x: ["-30%", "20%"]');
 s=s.replace('className={index % 2 ? "sm:mt-9" : ""}','');
 s=s.slice(0,s.indexOf('function FoldedNote('))+`function FoldedNote({ ctx }: { ctx: RenderCtx }) { return <Scene className="px-6 py-8" still><details className="tp-folded-note mx-auto max-w-xl border p-6" style={{background:ctx.theme.panel,borderColor:ctx.theme.line}}><summary className="min-h-11 cursor-pointer font-mono text-xs">A note between us · open</summary><p className="mt-5 font-hand text-3xl" data-long-copy={(ctx.memories.insideJoke?.length??0)>160||undefined}>{ctx.memories.insideJoke||"A small joke folded into the quiet."}</p></details></Scene>; }
function Letter({ ctx }: { ctx: RenderCtx }) { return <Scene className="px-6 py-12" still><details open className="mx-auto max-w-2xl border p-7 shadow-lg sm:p-12" style={{background:ctx.theme.panel,borderColor:ctx.theme.line}}><summary className="min-h-11 cursor-pointer font-mono text-xs">A birthday letter for {ctx.name}</summary><p className="mt-7 font-display text-2xl leading-relaxed" data-long-copy>{ctx.memories.message||\`Happy birthday, \${ctx.name}. There is so much good still ahead.\`}</p></details></Scene>; }
`;
 s=s.replace('    <Letter ctx={ctx} />\n    <PersonalizationSections ctx={ctx} />','    <PersonalizationSections ctx={ctx} />\n    <Letter ctx={ctx} />');
 return s;
});
await edit('after-dark',s=>s
 .replace(/ onPointerMove=\{\(event\) => \{[^\n]*?\}\}/,'')
 .replace('    <div aria-hidden className="tp-night-trail pointer-events-none fixed z-20 h-40 w-40 rounded-full" />\n','')
 .replace('opacity: flash ? 1 : 0','opacity: flash ? .25 : 0')
 .replace('absolute inset-0 z-20 bg-white','absolute inset-x-10 bottom-8 z-20 h-px bg-white')
 .replace('rotate: -7','rotate: -.8')
 .replace('animate={reduced ? undefined : { opacity: [.35, 1, .35], scale: [.98, 1.02, .98] }} transition={{ duration: 2.4, repeat: Infinity }}','')
 .replace('tap for the first flash','a night worth remembering'));
await edit('internet-person',s=>s
 .replace('reduced ? 0 : 1250','reduced ? 0 : 350')
 .replace('initial={{ width: 0 }} animate={{ width: "100%" }}','initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}')
 .replace('restoring the good files…</p>','restoring the good files…</p><button type="button" className="min-h-11 mt-3 px-4" onClick={()=>setBooted(true)}>Open desktop now →</button>')
 .replace('<span>{ctx.fullName} / personal desktop</span>','<h1 className="!text-base !leading-normal">{ctx.fullName} / personal desktop</h1>')
 .replace('{new Date().getFullYear()}','{ctx.project.birthdayDate?.slice(0,4) || "ODE"}')
 .replace('ctx.memories.memory || ctx.memories.oneSentence','ctx.memories.memory || ctx.memories.oneSentence'));
await edit('dreamscape',s=>{
 s=s.replace('import { Photo } from "../system/photo";','import { Photo } from "../system/photo";\nimport { PhotoViewer } from "../system/PhotoViewer";');
 const a=s.indexOf('    <AnimatePresence>{portal ?');const b=s.indexOf('</AnimatePresence>',a);
 if(a>=0&&b>=0)s=s.slice(0,a)+'    {portal && <PhotoViewer photo={portal} onClose={()=>setPortal(null)} />}'+s.slice(b+18);
 s=s.replace('relative mx-auto mt-8 h-[28rem] max-w-3xl','relative mx-auto mt-8 grid grid-cols-2 items-start gap-5 max-w-3xl');
 s=s.replace('absolute w-[68%] max-w-lg','relative w-full min-w-0').replace('bottom-0 right-0 rotate-3','mt-10 rotate-1').replace('left-0 top-0 -rotate-3','-rotate-1');
 s=s.replace('className="relative grid h-64 w-64','className="relative grid min-h-64 w-full max-w-md p-8');
 s=s.replace('className="relative font-mono text-[9px] uppercase tracking-[.35em]"','className="relative font-mono text-sm leading-relaxed"');
 return s;
});
await edit('polaroid-wall',s=>{
 s=s.replace('import { PolaroidCard }','import { PhotoViewer } from "../system/PhotoViewer";\nimport { PolaroidCard }');
 const a=s.indexOf('    <AnimatePresence>{selected ?');const b=s.indexOf('</AnimatePresence>',a);
 if(a>=0&&b>=0)s=s.slice(0,a)+'    {selected && <PhotoViewer photo={selected} onClose={()=>setSelected(null)} />}'+s.slice(b+18);
 s=s.replace('left: -80, right: 80, top: -30, bottom: 30','left: -12, right: 12, top: -8, bottom: 8');
 s=s.replace('grid cursor-grab gap-6 active:cursor-grabbing sm:grid-cols-3','grid grid-cols-2 cursor-grab gap-5 active:cursor-grabbing sm:grid-cols-3');
 return s;
});
await edit('yearbook',s=>s
 .replace('viewportClassName="overflow-visible"','viewportClassName="tp-book-viewport"')
 .replace('className="absolute left-[8%] top-[18%] max-w-xs -rotate-3 font-hand text-3xl"','className="relative max-w-full -rotate-1 font-hand text-3xl"')
 .replace('className="absolute bottom-[18%] right-[5%] max-w-xs rotate-3 font-hand text-3xl"','className="relative mt-12 max-w-full rotate-1 font-hand text-3xl"')
 .replace('const spreads: Spread[] = [{ id: "intro", kind: "intro" }, ...photoSpreads,','const spreads: Spread[] = [...photoSpreads.slice(0,1), { id: "intro", kind: "intro" }, ...photoSpreads.slice(1),')
 .replace('the book turns itself · hover, focus, or drag to pause','your collected pages · pause to read, swipe to turn'));
await edit('poster-city',s=>{
 s=s.replace('className="relative h-full min-h-[36svh]"','className="relative grid min-h-[36svh]"');
 s=s.replaceAll('className="absolute inset-0 grid place-items-center p-5 text-center"','className="col-start-1 row-start-1 grid place-items-center p-3 text-center"');
 s=s.replaceAll('className="absolute inset-0 grid place-items-center p-8 text-center"','className="col-start-1 row-start-1 grid place-items-center p-5 text-center"');
 s=s.replace('TURN THE<br />BILLBOARD','TURN THE<br />POSTER');
 s=s.replace('text-[clamp(3.5rem,10vw,7rem)]','text-[clamp(2rem,6vw,5rem)]');
 s=s.replace('mt-5 tp-vertical mx-auto','mt-5 mx-auto');
 return s;
});
// Palette selections should affect the complete scene, including dark templates.
for(const id of ['contact-sheet','cinema','after-dark'])await edit(id,s=>s
 .replaceAll('bg-[#120909] text-[#f2ded2]','bg-[var(--tp-bg)] text-[var(--tp-text)]')
 .replaceAll('bg-[#eadfd2]','bg-[var(--tp-panel)]').replaceAll('text-[#1d1713]','text-[var(--tp-text)]')
 .replaceAll('bg-[#1b0b0b]','bg-[var(--tp-bg)]')
 .replaceAll('bg-black text-[#eee9df]','bg-[var(--tp-bg)] text-[var(--tp-text)]')
 .replaceAll('bg-[#eee9df]','bg-[var(--tp-panel)]').replaceAll('text-black','text-[var(--tp-text)]')
 .replaceAll('bg-[#050505] text-[#f7f3e9]','bg-[var(--tp-bg)] text-[var(--tp-text)]'));
