import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { createEmptyProject } from "../src/lib/types";
import { activeLocalWebsite, localWebsites, removeLocalWebsite, saveLocalWebsite } from "../src/lib/localWebsites";
beforeEach(() => { const values = new Map<string,string>(); vi.stubGlobal("localStorage", { getItem: (key:string) => values.get(key) || null, setItem:(key:string,value:string) => values.set(key,value) }); });
afterEach(() => vi.unstubAllGlobals());
it("keeps multiple separate birthday drafts and isolates accounts", () => {
  const a = createEmptyProject(), b = createEmptyProject(); saveLocalWebsite("alice", a); saveLocalWebsite("alice", b);
  expect(Object.keys(localWebsites("alice"))).toHaveLength(2); expect(activeLocalWebsite("alice")?.id).toBe(b.id); expect(Object.keys(localWebsites("bob"))).toHaveLength(0);
});
it("migrates the legacy draft without deleting it or resurrecting a removed project", () => {
  const legacy = createEmptyProject(); localStorage.setItem("birthday-world/project/v1", JSON.stringify(legacy));
  expect(localWebsites("alice")[legacy.id]).toBeDefined(); expect(localWebsites("bob")[legacy.id]).toBeUndefined();
  removeLocalWebsite("alice", legacy.id); expect(localWebsites("alice")[legacy.id]).toBeUndefined(); expect(localStorage.getItem("birthday-world/project/v1")).toContain(legacy.id);
});
it("moves a device draft into the first signed-in account", () => {
  const draft = createEmptyProject(); saveLocalWebsite("device", draft); expect(localWebsites("alice")[draft.id]).toBeDefined(); expect(localWebsites("device")[draft.id]).toBeUndefined(); expect(localWebsites("bob")[draft.id]).toBeUndefined();
});
