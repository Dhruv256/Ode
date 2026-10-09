import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
vi.mock('@/lib/serverAuth',async importOriginal=>({...await importOriginal<typeof import('../src/lib/serverAuth')>(),requireOwner:vi.fn(async()=> 'test-owner')}));
import {validateBirthdayUpload} from '../src/lib/birthdayMedia';
import {POST} from '../src/app/api/media/sign/route';
import {requireOwner} from '../src/lib/serverAuth';
const input={projectId:'world',assetId:'photo',fileName:'memory.jpg',contentType:'image/jpeg',kind:'image',size:100};
beforeEach(()=>{vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://project.supabase.co');vi.stubEnv('SUPABASE_SECRET_KEY','synthetic-server-key');vi.mocked(requireOwner).mockResolvedValue('test-owner');});
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();vi.restoreAllMocks();});
describe('birthday upload signing',()=>{
  it.each(['image/svg+xml','image/html','image/unknown','text/html'])('rejects active/unsupported content %s before signing',mime=>{expect(()=>validateBirthdayUpload({...input,contentType:mime})).toThrow();});
  it('enforces kind/MIME agreement and finite file sizes',()=>{
    for(const size of [-1,0,NaN,Infinity,52428801,1.5]) expect(()=>validateBirthdayUpload({...input,size})).toThrow();
    expect(()=>validateBirthdayUpload({...input,kind:'audio'})).toThrow();
    expect(validateBirthdayUpload({...input,kind:'audio',contentType:'audio/webm;codecs=opus'}).contentType).toBe('audio/webm');
  });
  it('bounds JSON bytes, requires authentication, and makes no storage call on refusal',async()=>{
    const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
    expect((await POST(new Request('http://localhost',{method:'POST',body:'x'.repeat(4097)}))).status).toBe(413);
    expect((await POST(new Request('http://localhost',{method:'POST',body:JSON.stringify({...input,contentType:'image/svg+xml'})}))).status).toBe(415);
    vi.mocked(requireOwner).mockRejectedValueOnce(Object.assign(new Error('sign in'),{name:'RequestError'}));
    vi.spyOn(console,'error').mockImplementation(()=>{});
    expect((await POST(new Request('http://localhost',{method:'POST',body:JSON.stringify(input)}))).status).not.toBe(200);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('signs an owner-scoped path and refuses foreign storage URLs without leaking provider errors',async()=>{
    const fetch=vi.fn().mockResolvedValueOnce(Response.json({url:'/object/upload/sign/birthday-media/asset?token=synthetic'})).mockResolvedValueOnce(Response.json({url:'https://attacker.example/upload'})).mockResolvedValueOnce(Response.json({message:'secret diagnostic'}, {status:500}));
    vi.stubGlobal('fetch',fetch);vi.spyOn(console,'error').mockImplementation(()=>{});
    const request=()=>new Request('http://localhost',{method:'POST',body:JSON.stringify(input)});
    expect((await POST(request())).status).toBe(200);
    expect(fetch.mock.calls[0][0]).toContain('worlds/test-owner/world/');
    expect((await POST(request())).status).toBe(502);
    expect(JSON.stringify(await (await POST(request())).json())).not.toContain('secret diagnostic');
  });
});
