import { describe, expect, it } from "vitest";
import { createEmptyProject, type PhotoAsset } from "../src/lib/types";
import { projectReducer } from "../src/state/projectStore";

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
