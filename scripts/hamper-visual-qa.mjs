import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = "http://localhost:3100";
const output = "qa-screenshots/hamper-objects";
await mkdir(output, { recursive: true });
const browser = await chromium.launch();

async function openHamper(page, path) {
  await page.goto(`${base}${path}`);
  for (let stage = 1; stage <= 3; stage++) {
    await page.getByRole("button", { name: new RegExp(`tap ${stage} of 3`) }).click();
    await page.waitForTimeout(stage === 3 ? 1650 : 450);
  }
  await page.locator("button[data-type]").first().waitFor();
}

async function inspect(name, viewport, path, fullPage = true) {
  const page = await browser.newPage({ viewport });
  await openHamper(page, path);
  const report = await page.locator("button[data-type]").evaluateAll(nodes => {
    const boxes = nodes.map(node => { const r = node.getBoundingClientRect(); const style = getComputedStyle(node); return { left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,border:style.borderStyle,background:style.backgroundColor,type:node.dataset.type,variant:node.querySelector("[data-variant]")?.getAttribute("data-variant") }; });
    let overlaps = 0;
    for (let i=0;i<boxes.length;i++) for (let j=i+1;j<boxes.length;j++) if (Math.max(0,Math.min(boxes[i].right,boxes[j].right)-Math.max(boxes[i].left,boxes[j].left))*Math.max(0,Math.min(boxes[i].bottom,boxes[j].bottom)-Math.max(boxes[i].top,boxes[j].top)) > 4) overlaps++;
    return { count:boxes.length, overlaps, maxRight:Math.max(...boxes.map(box=>box.right)), minLeft:Math.min(...boxes.map(box=>box.left)), bordered:boxes.filter(box=>box.border!=="none").length, backgrounds:[...new Set(boxes.map(box=>box.background))], widths:[...new Set(boxes.map(box=>Math.round(box.width)))], noteVariants:[...new Set(boxes.filter(box=>box.type==="note").map(box=>box.variant))] };
  });
  await page.screenshot({ path:`${output}/${name}.png`, fullPage });
  console.log(name, JSON.stringify(report));
  await page.close();
}

await inspect("case-a-retro-burst-desktop", { width:1440,height:900 }, "/qa/hamper?theme=proper-retro");
await inspect("case-b-d-retro-scene-46-desktop", { width:1440,height:900 }, "/qa/hamper?case=46&style=scene&theme=proper-retro");
await inspect("case-e-mobile-390", { width:390,height:844 }, "/qa/hamper?case=46&style=scene&theme=proper-retro");
await inspect("case-f-ten-notes", { width:1100,height:800 }, "/qa/hamper?case=10-notes");

const builder = await browser.newPage({ viewport:{ width:1180,height:850 } });
await builder.goto(`${base}/qa/hamper?mode=builder`);
await builder.getByRole("button", { name:"4. Fill it" }).click();
await builder.screenshot({ path:`${output}/creator-object-picker.png`, fullPage:true });
console.log("creator", JSON.stringify({ choices:await builder.locator("button[aria-label]").filter({ has:builder.locator("[data-variant]") }).count(), bordered:await builder.locator("[data-variant]").evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node.parentElement).borderStyle)) }));
await builder.close();
await browser.close();
