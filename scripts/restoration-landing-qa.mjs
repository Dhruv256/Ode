import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const phase=process.argv[2]||'after', dir=`qa-screenshots/restoration-${phase}/landing`;
const base=process.env.ODE_QA_URL||'http://localhost:3100';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}), results=[];
try {
  if(phase==='before') {
    const page=await browser.newPage({viewport:{width:1366,height:768}});
    await page.goto('https://ode-flame.vercel.app/',{waitUntil:'networkidle'});
    await page.screenshot({path:`${dir}/production-reference-1366.png`});
    await page.close();
  }
  for(const [width,height] of [[1920,1080],[1440,900],[1366,768],[1280,720],[1024,768],[768,1024],[430,932],[390,844],[360,800]]) {
    for(const zoom of [1,1.25]) {
      const page=await browser.newPage({viewport:{width:Math.floor(width/zoom),height:Math.floor(height/zoom)},deviceScaleFactor:zoom});
      const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>requests.push({url:r.url(),error:r.failure()?.errorText}));
      await page.goto(`${base}/`,{waitUntil:'networkidle'});
      for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=400) {await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(70);}
      await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(900);
      await page.screenshot({path:`${dir}/${width}-${height}-${zoom*100}.png`,fullPage:true});
      const info=await page.evaluate(()=>{
        const rect=s=>document.querySelector(s)?.getBoundingClientRect();
        const title=rect('h1'),bottom=rect('[class*=heroBottom]'),gallery=rect('[class*=heroGallery]');
        const overlap=(a,b)=>a&&b&&Math.min(a.right,b.right)>Math.max(a.left,b.left)&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top);
        return {overflow:document.documentElement.scrollWidth>innerWidth,titleGalleryOverlap:overlap(title,gallery),copyGalleryOverlap:overlap(bottom,gallery),hamperHref:document.querySelector('#hampers a')?.getAttribute('href')};
      });
      results.push({width,height,zoom,...info,errors,requests});console.log(JSON.stringify(results.at(-1)));await page.close();
    }
  }
}finally {await writeFile(`${dir}/results.json`,JSON.stringify(results,null,2));await browser.close();}
