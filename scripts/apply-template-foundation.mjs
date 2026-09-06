import ts from 'typescript';
import {readFile,writeFile} from 'node:fs/promises';
const frames={'contact-sheet':['portrait','landscape'],'cut-and-paste':['portrait','portrait'],'cover-star':['portrait','portrait'],cinema:['cinematic','cinematic'],'internet-person':['portrait','landscape'],archive:['portrait','portrait'],'after-dark':['portrait','portrait'],'sunday-morning':['portrait','postcard'],'polaroid-wall':['square','square'],dreamscape:['portrait','portrait'],'poster-city':['portrait','portrait'],yearbook:['portrait','portrait']};
for(const [id,ratios] of Object.entries(frames)){
const path=`src/templates/${id}/index.tsx`;let text=await readFile(path,'utf8');
if(text.includes('import { Scene'))continue;
const source=ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const edits=[];let scene=0;
function walk(node){
  if(ts.isJsxElement(node)&&node.openingElement.tagName.getText(source)==='section'&&node.openingElement.attributes.properties.some(a=>a.name?.getText(source)==='data-experience-chapter')){
    const open=node.openingElement;const close=node.closingElement;
    edits.push([open.tagName.getStart(source),open.tagName.end,'Scene'],[close.tagName.getStart(source),close.tagName.end,'Scene']);
    if(scene++%3===0)edits.push([open.attributes.end,open.attributes.end,' still']);
  }
  if((ts.isJsxSelfClosingElement(node)||ts.isJsxOpeningElement(node))&&node.tagName.getText(source)==='Photo'){
    const photo=node.attributes.properties.find(a=>a.name?.getText(source)==='photo');const hero=photo?.getText(source).includes('allocation.hero');
    const ratio=hero?ratios[0]:ratios[1];edits.push([node.attributes.end,node.attributes.end,` ratio="${ratio}"${hero?' priority':''}`]);
    const aspect=node.attributes.properties.find(a=>a.name?.getText(source)==='aspect');
    if(aspect?.initializer&&ts.isJsxExpression(aspect.initializer))edits.push([aspect.initializer.getStart(source),aspect.initializer.end,'"w-full"']);
  }
  if(ts.isJsxElement(node)&&['p','h1','h2','blockquote'].includes(node.openingElement.tagName.getText(source))){
    const expr=node.children.filter(ts.isJsxExpression).map(child=>child.getText(source)).join(' ');
    const memory=expr.match(/ctx\.memories\.(message|memory|ending|insideJoke|oneSentence|alwaysSays)/)?.[1];
    if(memory)edits.push([node.openingElement.attributes.end,node.openingElement.attributes.end,` data-long-copy={(ctx.memories.${memory}?.length ?? 0) > 160 || undefined}`]);
  }
  ts.forEachChild(node,walk);
}walk(source);
for(const [start,end,replacement]of edits.sort((a,b)=>b[0]-a[0]))text=text.slice(0,start)+replacement+text.slice(end);
text=text.replace('"use client";','"use client";\n\nimport { Scene, MOTION } from "../system/motion";\nimport { PersonalizationSections } from "../system/PersonalizationSections";');
if(id!=='internet-person')text=text.replace('<footer','<PersonalizationSections ctx={ctx} />\n    <footer');
else text=text.replace('</AnimatePresence>\n  </div>;','</AnimatePresence>\n    <PersonalizationSections ctx={ctx} />\n    <footer className="tp-desktop-ending"><p>&gt; birthday.exe · update complete</p><h2>{ctx.memories.ending || "The best part is next."}</h2></footer>\n  </div>;');
text=text.replace(/viewport=\{\{ amount: (\.[0-9]+) \}\}/g,'viewport={{ once: true, amount: $1 }}');
text=text.replace(/duration: (\.\d+|1\.1|1\.2|1\.6)/g,(_,duration)=>`duration: MOTION.${Number(duration)>=.75?'hero':Number(duration)>=.45?'section':'content'}`);
await writeFile(path,text);
}
