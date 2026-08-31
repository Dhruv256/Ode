import { readFileSync } from "node:fs";
import { join } from "node:path";

const roots = ["src/templates", "src/motion"];
const templateIds = ["contact-sheet", "cut-and-paste", "cover-star", "cinema", "internet-person", "archive", "after-dark", "sunday-morning", "polaroid-wall", "dreamscape", "poster-city", "yearbook"];
const failures = [];

for (const id of templateIds) {
  const source = readFileSync(join("src/templates", id, "index.tsx"), "utf8");
  if (!source.includes("data-experience-chapter")) failures.push(`${id}: missing chapter landmarks`);
  if (!source.includes("memories.message")) failures.push(`${id}: birthday message is not explicit`);
  if (!source.includes("memories.ending")) failures.push(`${id}: final line is not explicit`);
  if (/storyFor\s*\(/.test(source)) failures.push(`${id}: catch-all story mapper remains`);
  if (/<Photo[\s\S]{0,260}className=["'`]h-full w-full["'`]/.test(source)) failures.push(`${id}: unbounded full-size Photo remains`);
}

for (const root of roots) {
  const files = templateIds.map((id) => join(root, id, "index.tsx"));
  if (root === "src/motion") files.splice(0, files.length, join(root, "ScrollScenes.tsx"), join(root, "DepthJourney.tsx"));
  if (root === "src/templates") files.push(join(root, "system", "collage.tsx"));
  for (const file of files) {
    let source;
    try { source = readFileSync(file, "utf8"); } catch { continue; }
    if (/overflow-x-(auto|scroll)|snap-x/.test(source)) failures.push(`${file}: native horizontal rail remains`);
  }
}

const registry = readFileSync("src/lib/experience.ts", "utf8");
const flows = [...registry.matchAll(/contentFlow:\s*\[([^\]]+)\]/g)].map((match) => [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]));
if (flows.length !== templateIds.length) failures.push(`experience registry: expected ${templateIds.length} flows, found ${flows.length}`);
flows.forEach((flow, index) => {
  if (flow.length !== 13 || new Set(flow).size !== 13) failures.push(`${templateIds[index] ?? index}: content flow must contain 13 unique memory keys`);
  if (flow.at(-2) !== "birthday-message" || flow.at(-1) !== "ending-line") failures.push(`${templateIds[index] ?? index}: message and ending must be separate final beats`);
});
const effects = [...registry.matchAll(/primaryEffect:\s*"([^"]+)"/g)].map((match) => match[1]);
if (effects.length !== templateIds.length || new Set(effects).size !== templateIds.length) failures.push("experience registry: primary effects are not unique");

if (failures.length) {
  console.error(`Template structural audit failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Template structural audit passed: ${templateIds.length} worlds, ${flows.length} unique 13-beat flows, no native rails.`);
