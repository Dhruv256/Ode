import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const phase = process.argv[2] || 'after';
const variant = process.argv[3] || 'normal';
const base = process.env.ODE_QA_URL || 'http://localhost:3100';
const dir = `qa-screenshots/restoration-${phase}`;
await mkdir(dir, { recursive: true });
const registry = await readFile('src/lib/templates.ts', 'utf8');
const templates = [...registry.matchAll(/^    id: "([^"]+)"/gm)].map(m => m[1]);
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
  for (const width of [1440, 390]) {
    const tiles = [];
    for (const template of templates) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [], requests = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('requestfailed', r => requests.push({url:r.url(), error:r.failure()?.errorText}));
      await page.goto(`${base}/qa/templates?template=${template}&photos=12&vibe=creative-soul&case=${variant}`, { waitUntil:'networkidle' });
      await page.locator('.birthday-template').waitFor();
      await page.waitForTimeout(600);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y=0; y<height; y+=650) {
        await page.evaluate(y=>scrollTo(0,y), y);
        await page.waitForTimeout(70);
      }
      for (const part of [0,.25,.5,.75,1]) {
        await page.evaluate(y=>scrollTo(0,y), (height-900)*part);
        await page.waitForTimeout(650);
        if(part===1) await page.waitForFunction(()=>[...document.querySelectorAll('.tp-message[data-message-started="true"] .tp-message-unit')].every(node=>Number(getComputedStyle(node).opacity)>.99 && ['none','blur(0px)'].includes(getComputedStyle(node).filter)),{},{timeout:16000});
        const file = `${dir}/${template}-${width}-${part*100}.png`;
        await page.screenshot({ path:file });
        if ([0,.5,1].includes(part)) tiles.push({file,template,part});
      }
      const info = await page.evaluate(()=>({height:document.documentElement.scrollHeight,
        overflow:document.documentElement.scrollWidth>innerWidth,
        photoIds:[...new Set([...document.querySelectorAll('[data-photo-id]')].map(n=>n.dataset.photoId))],
        broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length}));
      results.push({template,width,...info,errors,requests});
      console.log(JSON.stringify({template,width,...info,errors}));
      await page.close();
    }
    // Four templates per sheet, with opening, middle and ending in separate rows.
    for (let group=0;group<3;group++) {
      const members=tiles.slice(group*12,group*12+12);
      const tileWidth=width===390?195:360, tileHeight=width===390?450:225;
      const proof=await browser.newPage({viewport:{width:tileWidth*4,height:(tileHeight+26)*3}});
      const cards=await Promise.all(members.map(async t=>`<article><p>${t.template} ${t.part*100}%</p><img src="data:image/png;base64,${(await readFile(t.file)).toString('base64')}" /></article>`));
      await proof.setContent(`<style>*{box-sizing:border-box}body{margin:0;background:#292724;color:white;font:13px sans-serif;display:grid;grid-auto-flow:column;grid-template-rows:repeat(3,${tileHeight+26}px);grid-template-columns:repeat(4,${tileWidth}px)}p{height:26px;margin:0;padding:5px}img{display:block;width:${tileWidth}px;height:${tileHeight}px}</style>${cards.join('')}`);
      await proof.screenshot({path:`${dir}/proof-${width}-${group}.png`});
      await proof.close();
    }
  }
} finally {
  await writeFile(`${dir}/results.json`, JSON.stringify(results,null,2));
  await browser.close();
}
