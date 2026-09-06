import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
const phase=process.argv[2]||'before';
const ids=['contact-sheet','cut-and-paste','cover-star','cinema','internet-person','archive','after-dark','sunday-morning','polaroid-wall','dreamscape','poster-city','yearbook'];
const browser=await chromium.launch({channel:'chrome'});
try{for(const width of [390,1440])for(let batch=0;batch<3;batch++){
const page=await browser.newPage({viewport:{width:1440,height:width===390?1760:1400}});
let html='<style>body{margin:0;background:#333;color:white;font:14px sans-serif}main{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;padding:8px}img{width:100%;display:block}figure{margin:0}figcaption{height:24px}</style><main>';
for(const id of ids.slice(batch*4,batch*4+4))for(const part of [25,50,75]){const bytes=await readFile(`qa-screenshots/templates-${phase}/${id}-${width}-${part}.png`);html+=`<figure><figcaption>${id} · ${part}%</figcaption><img src="data:image/png;base64,${bytes.toString('base64')}"/></figure>`;}
await page.setContent(html+'</main>');await page.screenshot({path:`qa-screenshots/templates-${phase}/proof-${width}-${batch}.png`,fullPage:true});await page.close();
}}finally{await browser.close();}
