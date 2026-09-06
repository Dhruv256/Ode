import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'}),results=[];
try{const context=await browser.newContext();
for(const path of ['/anolaa-25','/missing-recipient-qa','/create','/dashboard','/api/websites','/api/projects','/qa/media','/qa/templates']){
 const response=await context.request.get(`${process.env.ODE_QA_BASE || 'http://localhost:3200'}${path}`,{maxRedirects:0});const body=await response.text();
 results.push({path,status:response.status(),location:response.headers().location,clerkHandshake:Boolean(response.headers()['x-clerk-auth-reason']),signIn:body.includes('Please sign in'),recipient:body.includes('birthday-template')});
}console.log(JSON.stringify(results,null,2));}finally{await writeFile('qa-screenshots/remaining/routes.json',JSON.stringify(results,null,2));await browser.close();}
