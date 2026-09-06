import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome'});
try{const page=await browser.newPage({viewport:{width:390,height:900}});await page.goto('http://localhost:3100/qa/templates?template=after-dark&photos=60&case=long',{waitUntil:'networkidle'});const card=page.locator('.tp-interest-cards article').first();await card.scrollIntoViewIfNeeded();const colors=await card.evaluate(el=>({background:getComputedStyle(el).backgroundColor,text:getComputedStyle(el.querySelector('h3')).color}));assert.notEqual(colors.background,'rgb(32, 32, 32)');console.log(colors);await page.screenshot({path:'qa-screenshots/remaining/after-dark-contrast-fixed.png'});}finally{await browser.close();}
