import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='qa-screenshots/remaining'; await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
const results=[];
const templates=['contact-sheet','cut-and-paste','cover-star','cinema','internet-person','archive','after-dark','sunday-morning','polaroid-wall','dreamscape','poster-city','yearbook'];
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
const page=await context.newPage(); page.setDefaultTimeout(20000);
const project=async()=>JSON.parse(await page.locator('[data-qa-project]').textContent());
async function check(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS',name);}catch(error){results.push({name,pass:false,error:error.stack});console.log('FAIL',name,error.stack);await page.keyboard.press('Escape');await page.screenshot({path:`${dir}/${name.replace(/[^a-z0-9]/gi,'-')}.png`}).catch(()=>{});}}
try {
 await page.goto('http://localhost:3100/qa/media'); await page.locator('input[type=file]').waitFor({state:'attached'});
 // Encoded JPEG/PNG uploads, including panorama/portrait/low-resolution files.
 const encoded=await page.evaluate(async()=>{const dims=[[1800,2400],[2400,1800],[1200,1200],[3000,240],[160,120]];return await Promise.all(dims.map(async([w,h],i)=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');c.fillStyle=['#b3c7bc','#d8ba98','#99b6cd','#cab2cc','#e3ccad'][i];c.fillRect(0,0,w,h);c.fillStyle='#283e3a';c.fillRect(w*.3,h*.25,w*.4,h*.5);c.fillStyle='white';c.font=`${Math.max(16,w/20)}px sans-serif`;c.fillText(`Original ${w} × ${h}`,w*.05,h*.15);return canvas.toDataURL(i%2?'image/png':'image/jpeg',.9);}));});
 const files=Array.from({length:75},(_,i)=>({name:`original-${i}.${i%5%2?'png':'jpg'}`,mimeType:i%5%2?'image/png':'image/jpeg',buffer:Buffer.from(encoded[i%5].split(',')[1],'base64')}));
 await check('75 binary uploads',async()=>{await page.locator('input[type=file]').setInputFiles(files);await page.waitForFunction(()=>JSON.parse(document.querySelector('[data-qa-project]').textContent).photos.length===75);assert.equal((await project()).photos.length,75);assert.equal(new Set((await project()).photos.map(p=>p.id)).size,75);});
 const original=await project();
 await page.waitForTimeout(700);
 await check('reload persists 75 original bytes',async()=>{await page.reload();await page.locator('[data-qa-project]').waitFor({state:'attached'});const p=await project();assert.equal(p.photos.length,75);assert.ok(p.photos.every(x=>!x.needsRelink));const bytes=await page.evaluate(async()=>Promise.all(JSON.parse(document.querySelector('[data-qa-project]').textContent).photos.map(async p=>Array.from(new Uint8Array(await (await fetch(p.previewUrl)).arrayBuffer())))));for(let i=0;i<75;i++)assert.deepEqual(Buffer.from(bytes[i]),files[i].buffer);});
 await check('missing originals relink without duplicates',async()=>{await page.evaluate(async p=>{await new Promise((resolve,reject)=>{const r=indexedDB.open('ode-original-media-v1');r.onsuccess=()=>{const db=r.result;const tx=db.transaction('media','readwrite');for(const photo of p.photos.slice(0,5))tx.objectStore('media').delete(JSON.stringify([p.id,photo.id]));tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};});},original);await page.reload();await page.locator('[data-qa-project]').waitFor({state:'attached'});assert.equal((await project()).photos.filter(p=>p.needsRelink).length,5);await page.locator('input[type=file]').setInputFiles(files.slice(0,5));await page.waitForFunction(()=>JSON.parse(document.querySelector('[data-qa-project]').textContent).photos.every(p=>!p.needsRelink));assert.deepEqual((await project()).photos.map(p=>p.id),original.photos.map(p=>p.id));});
 await check('clear undo reload retains originals',async()=>{await page.getByRole('button',{name:'Clear all 75',exact:true}).click();await page.getByRole('button',{name:'Delete all photos',exact:true}).click();assert.equal((await project()).photos.length,0);await page.getByRole('button',{name:'Undo clear all'}).click();await page.waitForFunction(()=>JSON.parse(document.querySelector('[data-qa-project]').textContent).photos.length===75);await page.waitForTimeout(700);await page.reload();await page.locator('[data-qa-project]').waitFor({state:'attached'});assert.equal((await project()).photos.filter(p=>!p.needsRelink).length,75);});
 await check('keyboard focal point available',async()=>{await page.getByRole('button',{name:'Details',exact:true}).first().click();assert.equal(await page.getByRole('slider',{name:'Horizontal focal point'}).count(),1);});
 await page.getByRole('button',{name:'Preview photos',exact:true}).click();
 for(const template of templates) await check(`${template} 75 originals modal reduced-motion`,async()=>{
  await page.getByLabel('QA template').selectOption(template);await page.locator('.tp-high-photo-grid button').first().waitFor();assert.equal(await page.locator('.tp-high-photo-grid button').count(),75);
  const open=page.locator('.tp-high-photo-grid button').last();await open.scrollIntoViewIfNeeded();await open.focus();await page.keyboard.press('Enter');await page.getByRole('dialog').waitFor();await page.waitForFunction(()=>{const i=document.querySelector('dialog img');return i?.complete&&i.naturalWidth>0;});await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>!!document.activeElement.closest('dialog')),true);await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await open.evaluate(e=>e===document.activeElement),true);
  const rail=page.locator('.tp-auto-carousel').first();if(await rail.count()){await rail.scrollIntoViewIfNeeded();const before=await rail.innerText();await page.waitForTimeout(2800);assert.equal(await rail.innerText(),before);}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 });
}finally{await writeFile(`${dir}/results.json`,JSON.stringify(results,null,2));await browser.close();}
if(results.some(r=>!r.pass))process.exitCode=1;
