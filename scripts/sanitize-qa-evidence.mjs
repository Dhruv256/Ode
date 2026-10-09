import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
// Audit evidence may retain development-auth redirects; keep those tokens out of review artifacts.
function scrub(value,key=''){
  if(typeof value==='string'){
    if(/^(?:authorization|cookie|set-cookie)$/i.test(key))return '[REDACTED]';
    return value.replace(/((?:__clerk_handshake|__clerk_db_jwt)=)[^&\s"\\]+/g,'$1[REDACTED]')
      .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,'[REDACTED_JWT]')
      .replace(/nvapi-[A-Za-z0-9_-]+/g,'[REDACTED]');
  }
  if(Array.isArray(value))return value.map(entry=>scrub(entry,key));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,scrub(v,k)]));
  return value;
}
let changed=0;
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())await walk(file);else if(entry.name.endsWith('.json')){const original=await readFile(file,'utf8');const parsed=JSON.parse(original),cleaned=scrub(parsed);if(JSON.stringify(cleaned)!==JSON.stringify(parsed)){await writeFile(file,JSON.stringify(cleaned,null,2));changed++;}}}}
await walk('qa-screenshots');console.log(`Sanitized/formatted ${changed} QA JSON reports.`);
