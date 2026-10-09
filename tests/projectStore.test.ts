import { describe, expect, it } from "vitest";
import { createEmptyProject, type PhotoAsset } from "../src/lib/types";
import { projectReducer } from "../src/state/projectStore";
import { personalAnswers } from '../src/lib/personalization';

function photo(id: string, order: number): PhotoAsset {
  return { id, order, fileName:`${id}.jpg`, previewUrl:`blob:${id}`, width:100, height:100, orientation:"square", focalPoint:{ x:.5,y:.5 }, fit:"fill", heroEligible:true, isHero:order===0 };
}

describe("project photo actions", () => {
  it("clears every photo in one reducer action", () => {
    const project = { ...createEmptyProject(), photos:[photo("one",0),photo("two",1),photo("three",2)] };
    const cleared = projectReducer(project, { type:"clearPhotos" });
    expect(cleared.photos).toEqual([]);
    expect(cleared).not.toBe(project);
  });

  it("does not touch an already-empty project", () => {
    const project = createEmptyProject();
    expect(projectReducer(project, { type:"clearPhotos" })).toBe(project);
  });
});

describe('legacy memory edits',()=>{
  const legacy=()=>({...createEmptyProject(),memories:[{id:'three-words',answer:'Old answer',skipped:false},{id:'favorite-song',answer:'  Dreams 🎵\nLive version  ',skipped:false}] as unknown as ReturnType<typeof createEmptyProject>['memories']});
  it('replaces the original schema field without hiding the new answer behind a duplicate',()=>{
    const changed=projectReducer(legacy(),{type:'setMemoryAnswer',key:'three-words',answer:'  Funny · caring · dramatic 🥹\n  '});
    expect(changed.memories).toHaveLength(2);
    expect(personalAnswers(changed.memories).find(m=>m.key==='three-words')?.answer).toBe('  Funny · caring · dramatic 🥹\n  ');
    expect(personalAnswers(changed.memories).find(m=>m.key==='favorite-song')?.answer).toBe('  Dreams 🎵\nLive version  ');
  });
  it('skips a historical field without leaving its old answer visible',()=>{
    const changed=projectReducer(legacy(),{type:'skipMemory',key:'three-words'});
    expect(changed.memories).toHaveLength(2);
    expect(personalAnswers(changed.memories).map(m=>m.key)).toEqual(['favorite-song']);
  });
});
