/** Original media stays in this browser until the creator publishes it. Keys are project scoped. */
const DB = "ode-original-media-v1";
function openMedia():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB,1);
  request.onupgradeneeded=()=>request.result.createObjectStore("media");
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
});}
const key=(projectId:string,assetId:string)=>JSON.stringify([projectId,assetId]);
export async function saveLocalMedia(projectId:string,assetId:string,blob:Blob):Promise<boolean>{
  let db:IDBDatabase|undefined;
  try {db=await openMedia();await new Promise<void>((resolve,reject)=>{const tx=db!.transaction("media","readwrite");tx.objectStore("media").put(blob,key(projectId,assetId));tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});return true;}catch{return false;}finally{db?.close();}
}
export async function readLocalMedia(projectId:string,assetId:string):Promise<Blob|undefined>{
  let db:IDBDatabase|undefined;try{db=await openMedia();return await new Promise((resolve,reject)=>{const request=db!.transaction("media").objectStore("media").get(key(projectId,assetId));request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}catch{return;}finally{db?.close();}
}
export async function removeLocalMedia(projectId:string,assetIds:readonly string[]):Promise<void>{
  let db:IDBDatabase|undefined;try{db=await openMedia();await new Promise<void>((resolve,reject)=>{const tx=db!.transaction("media","readwrite");for(const id of assetIds)tx.objectStore("media").delete(key(projectId,id));tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}catch{/* Storage unavailable: creation remains possible. */}finally{db?.close();}
}
