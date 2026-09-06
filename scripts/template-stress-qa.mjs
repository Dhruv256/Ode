import { chromium } from 'playwright';
import { mkdir,writeFile } from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'}), results=[];
const dir='qa-screenshots/final-audit';await mkdir(dir,{recursive:true});
const templates=['contact-sheet','cut-and-paste','cover-star','cinema','internet-person','archive','after-dark','sunday-morning','polaroid-wall','dreamscape','poster-city','yearbook'];
try{for(const id of templates){const page=await browser.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [count,variant,width] of [[5,'empty',320],[25,'short',390],[50,'normal',1440],[60,'long',390],[75,'long',1440]]){
  await page.setViewportSize({width,height:900});await page.goto(`http://localhost:3100/qa/templates?template=${id}&photos=${count}&case=${variant}`,{waitUntil:'networkidle'});await page.locator('.tp-collection').waitFor({state:'attached'});
  const summary=page.locator('.tp-collection summary');if(!(await summary.evaluate(el=>el.parentElement.open)))await summary.click();
  for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=800){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(25);}
  await page.waitForTimeout(200);
  const data=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,collection:document.querySelectorAll('.tp-high-photo-grid button').length,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length,hiddenWords:[...document.querySelectorAll('.tp-text-carousel .tp-carousel-track p')].filter(p=>getComputedStyle(p).visibility==='hidden').length,unnamedButtons:[...document.querySelectorAll('.birthday-template button')].filter(b=>!b.textContent.trim()&&!b.getAttribute('aria-label')&&!b.getAttribute('aria-labelledby')).length}));
  const row={id,count,variant,width,...data,errors:[...errors]};results.push(row);console.log(JSON.stringify(row));
  if(count===60||count===75){const height=await page.evaluate(()=>document.body.scrollHeight);for(const part of [.25,.5,.75]){await page.evaluate(y=>scrollTo(0,y),(height-900)*part);await page.waitForTimeout(100);await page.screenshot({path:`${dir}/${id}-${width}-${part*100}.png`});}}
 }
 await page.close();
}}finally{await writeFile(`${dir}/results.json`,JSON.stringify(results,null,2));await browser.close();}
if(results.some(r=>r.overflow||r.broken||r.hiddenWords||r.unnamedButtons||r.errors.length||r.collection!==r.count))process.exitCode=1;
