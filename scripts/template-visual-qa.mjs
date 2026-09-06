import { chromium } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
const phase = process.argv[2] || 'before';
const only = process.argv.find((arg) => arg.startsWith('--template='))?.slice('--template='.length);
const photoCount = Number(process.argv.find((arg) => arg.startsWith('--photos='))?.slice('--photos='.length)) || 12;
const widths = process.argv.includes('--mobile-only') ? [390] : [390, 1440];
const templates = ['contact-sheet','cut-and-paste','cover-star','cinema','internet-person','archive','after-dark','sunday-morning','polaroid-wall','dreamscape','poster-city','yearbook'].filter((template) => !only || template === only);
const dir = `qa-screenshots/templates-${phase}`;
await mkdir(dir,{recursive:true});
const browser = await chromium.launch({channel:'chrome'});
const results=process.argv.includes('--resume')?JSON.parse(await readFile(`${dir}/results.json`,'utf8').catch(()=>'[]')):[];
try {
for (const template of templates) {
  for (const width of widths) {
    if(results.some(r=>r.template===template&&r.width===width))continue;
    const context=await browser.newContext({viewport:{width,height:900},hasTouch:width<500});
    const page=await context.newPage(); const errors=[]; page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://localhost:3100/qa/templates?template=${template}&photos=${photoCount}`,{waitUntil:'networkidle'});
    await page.locator('.birthday-template').waitFor();
    if(template==='internet-person')await page.waitForTimeout(1600);
    await page.screenshot({path:`${dir}/${template}-${width}-0.png`});
    const seen = new Set(); const frames=[];
    // Full recipient scroll, including every entrance, not just the first fold.
    for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=650){
      await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y); await page.waitForTimeout(100);
      for(const id of await page.locator('[data-photo-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.photoId))) seen.add(id);
    }
    const height=await page.evaluate(()=>document.body.scrollHeight);
    for(const part of [.25,.5,.75,1]){
      await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),(height-900)*part);await page.waitForTimeout(750);
      await page.screenshot({path:`${dir}/${template}-${width}-${part*100}.png`});
    }
    const carousel=page.locator('.tp-auto-carousel:visible').first();
    if(await carousel.count()){
      await carousel.scrollIntoViewIfNeeded(); await page.mouse.move(0,0);
      for(let i=0;i<5;i++){
        frames.push(await carousel.evaluate(el=>({height:el.getBoundingClientRect().height,photos:[...el.querySelectorAll('.tp-frame')].map(p=>({w:p.getBoundingClientRect().width,h:p.getBoundingClientRect().height}))})));
        await page.waitForTimeout(2500);
      }
      const next=carousel.getByRole('button',{name:'Next item'}).first();if(await next.count()) await next.click();
    }
    const info=await page.evaluate(()=>({height:document.body.scrollHeight,overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.images].length,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length}));
    results.push({template,width,...info,seen:[...seen],carousel:frames,errors});
    console.log(JSON.stringify({template,width,...info,errors}));
    await context.close();
  }
}
} finally { await writeFile(`${dir}/results.json`,JSON.stringify(results,null,2));await browser.close(); }
