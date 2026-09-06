import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'}),results=[];
try{for(const width of [390,1440]){const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();
 for(const path of ['/anolaa-25','/create','/dashboard']){const visited=[];page.on('request',r=>{if(r.isNavigationRequest())visited.push(new URL(r.url()).origin + new URL(r.url()).pathname);});let error;try{await page.goto(`http://localhost:3201${path}`,{waitUntil:'domcontentloaded',timeout:20000});await page.waitForTimeout(1500);}catch(e){error=e.message;}results.push({path,width,url:page.url(),recipient:await page.locator('.birthday-template').count(),navigation:[...visited],error});}
 await context.close();}console.log(JSON.stringify(results,null,2));}finally{await writeFile('qa-screenshots/remaining/browser-routes.json',JSON.stringify(results,null,2));await browser.close();}
