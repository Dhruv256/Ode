import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'}),results=[];
try { const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto('http://localhost:3100/qa/templates?template=sunday-morning&photos=60',{waitUntil:'networkidle'});
 const rail=page.locator('.tp-text-carousel').first(),words=rail.locator('.tp-carousel-track p');await rail.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
 assert.equal(await words.evaluate(p=>getComputedStyle(p).visibility),'visible');const first=await words.textContent();await page.waitForTimeout(2800);assert.notEqual(await words.textContent(),first);results.push('visible words and autoplay');
 await rail.hover();const hovered=await words.textContent();await page.waitForTimeout(2800);assert.equal(await words.textContent(),hovered);results.push('hover pauses');
 await rail.getByRole('button',{name:'Next item'}).focus();await page.mouse.move(0,0);const focused=await words.textContent();await page.waitForTimeout(2800);assert.equal(await words.textContent(),focused);await page.keyboard.press('ArrowRight');assert.notEqual(await words.textContent(),focused);results.push('focus pauses and keyboard advances');
 const open=page.locator('.tp-high-photo-grid button').first();await open.focus();await page.keyboard.press('Enter');await page.getByRole('dialog').waitFor();await page.keyboard.press('Shift+Tab');assert.ok(await page.evaluate(()=>document.activeElement.closest('dialog')));await page.getByRole('button',{name:'Close photo'}).click();await page.waitForFunction(()=>!document.querySelector('dialog'));assert.ok(await open.evaluate(e=>e===document.activeElement));assert.equal(await page.evaluate(()=>document.body.style.overflow),'');results.push('reverse Tab close button focus return and scroll unlock');
 await page.screenshot({path:'qa-screenshots/remaining/interaction-fixed.png'});
 console.log(results);
}finally {await writeFile('qa-screenshots/remaining/interactions.json',JSON.stringify(results,null,2));await browser.close();}
