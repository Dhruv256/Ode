import {describe,expect,it} from 'vitest';
import {validateWebsite} from '../src/lib/websiteProjects';
import {createEmptyProject} from '../src/lib/types';
describe('birthday publication input integrity',()=>{
  it('accepts incomplete local drafts without inventing optional content',()=>{expect(validateWebsite(createEmptyProject()).photos).toEqual([]);});
  it.each(['missing','__proto__','constructor'])('rejects unknown/prototype template ID %s',id=>{expect(()=>validateWebsite({...createEmptyProject(),templateId:id})).toThrow('available template');});
  it.each([
    {person:{fullName:'Amara',nickname:{}}}, {vibes:{vibes:{}}}, {interests:[{id:'interest',label:null}]},
    {memories:[{key:'birthday-message',answer:{},skipped:false}]}, {customMemories:{}}, {customPalette:['url(javascript:alert(1))']},
  ])('rejects malformed nested content that would crash recipients: %j',fields=>{expect(()=>validateWebsite({...createEmptyProject(),...fields})).toThrow();});
  it('retains exact long messages and formatting',()=>{
    const answer='Dear Amara,\n\n'+('Thank you. 👩🏽‍🚀 ❤️  '.repeat(100));
    expect(validateWebsite({...createEmptyProject(),memories:[{id:'message',key:'birthday-message',answer,skipped:false}]}).memories[0].answer).toBe(answer);
  });
  it('rejects dangerous and local soundtrack URLs in published gifts',()=>{
    for(const previewUrl of ['javascript:alert(1)','data:text/html,<script>','blob:local','https://user:pass@example.com/audio']) {
      expect(()=>validateWebsite({...createEmptyProject(),publishing:{status:'published',visibility:'link'},soundtrack:{fileName:'song.mp3',mimeType:'audio/mpeg',previewUrl}})).toThrow();
    }
  });
});
