import {mkdir,readFile,unlink,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

// Vendor ODE's existing families unchanged; preserve Google Fonts' Unicode subsets.
const url='https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Anton&family=Caveat:wght@400;600;700&family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&display=swap';
const previous=JSON.parse(await readFile('public/fonts/SOURCES.json','utf8').catch(()=>'{}'));
const response=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}});
if(!response.ok) throw new Error(`Font stylesheet HTTP ${response.status}`);
let css=await response.text();
await mkdir('public/fonts',{recursive:true});
const sources=[];
for(const match of [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)]) {
  const remote=match[1];
  if(sources.some(source=>source.url===remote)) continue;
  const font=await fetch(remote);
  if(!font.ok) throw new Error(`Font download HTTP ${font.status}`);
  const data=Buffer.from(await font.arrayBuffer());
  const digest=createHash('sha256').update(data).digest('hex');
  const extension=new URL(remote).pathname.split('.').pop();
  const path=`/fonts/${digest.slice(0,20)}.${extension}`;
  await writeFile(`public${path}`,data);
  sources.push({url:remote,path,sha256:digest,bytes:data.length});
}
for(const source of sources) css=css.replaceAll(source.url,source.path);
await writeFile('src/app/fonts.css','/* ODE original typography, self hosted. Licenses: /fonts/*-OFL.txt */\n'+css);
const preloads=[...css.matchAll(/@font-face\s*\{[^}]+\}/g)].map(match=>match[0]).filter(block=>block.includes('font-style: normal') && block.includes('U+0000-00FF') && /font-family: '(Bodoni Moda|Fraunces)'/.test(block)).map(block=>block.match(/url\(([^)]+)\)/)[1]);
await writeFile('src/app/font-preloads.json',JSON.stringify([...new Set(preloads)],null,2)+'\n');
for(const family of ['bodonimoda','anton','caveat','fraunces','spacegrotesk','ibmplexmono']) {
  const license=await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`);
  if(!license.ok) throw new Error(`Missing ${family} license`);
  await writeFile(`public/fonts/${family}-OFL.txt`,await license.text());
}
await writeFile('public/fonts/SOURCES.json',JSON.stringify({stylesheet:url,sources},null,2)+'\n');
for(const old of previous.sources??[]) if(/^\/fonts\/[a-f0-9]{20}\.(ttf|woff2)$/.test(old.path) && !sources.some(source=>source.path===old.path)) await unlink(`public${old.path}`);
console.log(`Vendored ${sources.length} font subsets; original six families and licenses retained.`);
