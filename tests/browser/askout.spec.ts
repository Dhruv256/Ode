import { test, expect, type Page } from "@playwright/test";
import { EMPTY_ASK_OUT, type AskOut } from "../../src/features/askout/types";
import { funnyDayOptions } from "../../src/features/askout/config";
import type { AskOutTheme } from "../../src/features/askout/types";
const sizes = [[360,800],[390,844],[393,852],[430,932]];
async function noOverflow(page: Page) { expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true); }
async function tap(page:Page,name:string|RegExp){const button=page.getByRole("button",{name});await expect(button).toBeVisible();await button.click();}
async function slide(page:Page,label:string){const slider=page.getByLabel(label);await expect(slider).toBeVisible();await slider.fill("100");}
async function completeThemeInteractions(page:Page,theme:AskOutTheme,playful=false){
  if(theme==="tagged-message"){await tap(page,"Open suspicious message");await slide(page,"Swipe to open");const peel=page.getByRole("button",{name:"Press and hold to peel"});await expect(peel).toBeVisible();await peel.dispatchEvent("pointerdown");await page.waitForTimeout(900);if(!playful)await tap(page,"Unfortunately, yes");}
  if(theme==="cat-investigation"){await tap(page,"Pet detective to continue");await slide(page,"Drag clue");for(let i=0;i<4;i++)await tap(page,/Scratch clue|Remarkable detective work/);await tap(page,"Tap paw for approval");}
  if(theme==="magical-message"){await tap(page,"Inspect delivery");await tap(page,"Open suspicious letter");await slide(page,"Trace the spell");await tap(page,"Break seal");}
  if(theme==="scrapbook"){await tap(page,"Open the cover");await slide(page,"Drag sticker");await tap(page,"Flip the Polaroid");await tap(page,"Plot advanced");await slide(page,"Tape the note");}
  if(theme==="tiny-exhibit"){await tap(page,"Enter exhibit");await tap(page,"Inspect plaque");await slide(page,"Move spotlight");await tap(page,"Stamp the ticket");}
}
async function completePlayfulGate(page:Page,theme:AskOutTheme){
  if(theme==="tagged-message"){const no=page.getByRole("button",{name:/^(No thanks|Nope|Still nope|Nice try|Almost|This button has trust issues|Please stop chasing me 😭)$/});await no.dispatchEvent("pointerdown");await tap(page,"Unfortunately, yes");}
  if(theme==="cat-investigation"){await tap(page,"Not interested in seeing this");await expect(page.getByText(/procedural grounds/)).toBeVisible();await tap(page,"Present evidence");}
  if(theme==="magical-message"){await tap(page,"Close the letter");await expect(page.getByText(/misplaced that option/)).toBeVisible();await tap(page,"Continue");}
  if(theme==="scrapbook"){await tap(page,"Skip this page");await expect(page.getByRole("button",{name:"Nice try."})).toBeVisible();await tap(page,"Turn the page");}
  if(theme==="tiny-exhibit"){await tap(page,"Leave exhibition");await expect(page.getByText(/currently unavailable/)).toBeVisible();await tap(page,"Continue tour");}
}
async function advanceToFinal(page: Page) {
  await completeThemeInteractions(page,"tagged-message");
  await tap(page,"Reveal context"); await page.locator("button").filter({ hasText: "Day after Saturday" }).click();
  await page.locator("button").filter({ hasText:/correct answer/ }).click(); await tap(page,"Reveal actual reason");
}
for (const [width,height] of sizes) test(`public Ask Out fits, accepts and exposes real details at ${width}x${height}`, async ({ page }) => {
  await page.route("**/api/askout/**/responses", route => route.fulfill({ json: { ok:true } })); await page.setViewportSize({ width,height }); await page.goto("/qa/askout"); await noOverflow(page);
  await advanceToFinal(page); await noOverflow(page); await page.getByRole("button", { name: "Tell me more" }).click(); await expect(page.getByText(/transport is sorted/)).toBeVisible();
  await page.getByRole("button", { name: "Yes :)" }).click(); await expect(page.getByRole("heading", { name: "Case closed. Date confirmed." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open in Maps" })).toHaveAttribute("href", /12%20Book%20Street/); await expect(page.getByRole("link", { name: "Add to Calendar" })).toHaveAttribute("download", "our-plan.ics"); await noOverflow(page);
});
test("final decline is stationary, respectful, and terminal", async ({ page }) => {
  await page.emulateMedia({ reducedMotion:"reduce" }); await page.route("**/api/askout/**/responses", route => route.fulfill({ json: { ok:true } })); await page.goto("/qa/askout"); await advanceToFinal(page);
  const decline = page.getByRole("button", { name: "Not this time" }); await page.waitForTimeout(400); const before = await decline.boundingBox(); await decline.hover(); await page.waitForTimeout(100); const after = await decline.boundingBox(); expect(after).toEqual(before);
  await decline.click(); await expect(page.getByRole("heading", { name: "Fair enough :)" })).toBeVisible(); await expect(page.getByRole("button")).toHaveCount(0);
});
for (const theme of ["tagged-message","cat-investigation","magical-message","scrapbook","tiny-exhibit"] as AskOutTheme[]) test(`${theme} has a unique complete flow after direct refresh`, async ({ page }) => {
  await page.route("**/api/askout/**/responses", route => route.fulfill({ json: { ok:true } })); await page.setViewportSize({ width:390,height:844 }); await page.goto(`/qa/askout?theme=${theme}`); await page.reload(); await expect(page.locator(`main[data-theme="${theme}"]`)).toBeVisible(); await completeThemeInteractions(page,theme); await expect(page.getByRole("heading").first()).toBeVisible(); await noOverflow(page);
  const art = page.locator(`main[data-theme="${theme}"] img`).first(); await expect(art).toBeVisible(); expect(await art.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0); expect(decodeURIComponent(await art.getAttribute("src") || "")).toContain(`/askout-assets/${theme === "scrapbook" ? "scrapbook" : theme}.webp`);
});
test("early playful No stays inside its interaction area on pointer and touch input", async ({ page }) => {
  await page.setViewportSize({ width:360,height:800 }); await page.goto("/qa/askout?playful=1");
  const no = page.getByRole("button", { name:/^(No thanks|Nope|Still nope|Nice try|Almost|This button has trust issues|Please stop chasing me 😭)$/ }); const area = no.locator("xpath=..");
  for (let attempt=0; attempt<4; attempt++) { await no.dispatchEvent("pointerdown"); const [buttonBox,areaBox] = await Promise.all([no.boundingBox(),area.boundingBox()]); expect(buttonBox).not.toBeNull(); expect(areaBox).not.toBeNull(); expect(buttonBox!.x).toBeGreaterThanOrEqual(areaBox!.x); expect(buttonBox!.y).toBeGreaterThanOrEqual(areaBox!.y); expect(buttonBox!.x+buttonBox!.width).toBeLessThanOrEqual(areaBox!.x+areaBox!.width+1); expect(buttonBox!.y+buttonBox!.height).toBeLessThanOrEqual(areaBox!.y+areaBox!.height+1); }
});
test("all five theme interaction journeys also complete at desktop width", async ({ page }) => {
  await page.route("**/api/askout/**/responses", route => route.fulfill({ json: { ok:true } })); await page.setViewportSize({ width:1366,height:850 });
  for (const theme of ["tagged-message","cat-investigation","magical-message","scrapbook","tiny-exhibit"] as AskOutTheme[]) { await page.goto(`/qa/askout?theme=${theme}`); await completeThemeInteractions(page,theme); await expect(page.getByRole("heading").first()).toBeVisible(); await noOverflow(page); }
});
for (const theme of ["tagged-message","cat-investigation","magical-message","scrapbook","tiny-exhibit"] as AskOutTheme[]) test(`${theme} playful journey keeps the final choice real`, async ({ page }) => {
  await page.route("**/api/askout/**/responses", route => route.fulfill({ json: { ok:true } })); await page.setViewportSize({ width:390,height:844 }); await page.goto(`/qa/askout?theme=${theme}&playful=1`); await expect(page.getByText(/Playful journey mode enabled/)).toHaveCount(0); await completePlayfulGate(page,theme); await completeThemeInteractions(page,theme,true); await tap(page,/Reveal context|Present evidence|Turn the page|View exhibit 02/); await page.locator("button").filter({hasText:/→ Sunday/}).first().click(); await page.locator("button").filter({hasText:/→ 7:00 PM/}).first().click(); await tap(page,/Reveal actual reason|Read conclusion|Read final line|Turn to last page|Open final exhibit/); await expect(page.getByRole("button",{name:"Yes :)"})).toBeVisible(); await expect(page.getByRole("button",{name:"Tell me more"})).toBeVisible(); await expect(page.getByRole("button",{name:"Not this time"})).toBeVisible(); await page.getByRole("button",{name:"Not this time"}).click(); await expect(page.getByText(/Fair enough|Case closed|universe accepts|No worries|Thank you for visiting/).first()).toBeVisible();
});
test("creator configures, previews, publishes, and returns to an editable link", async ({ page }) => {
  let stored: AskOut = { ...EMPTY_ASK_OUT, id:"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", slug:"secret-abcd1234", status:"draft", createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), responses:{ viewed:0,started:0,tell_more:0,accepted:0,declined:0 } };
  let posts = 0;
  await page.route("**/api/askouts**", async route => {
    const request = route.request();
    if (request.method() === "POST" || request.method() === "PUT") { const body = request.postDataJSON(); if (request.method() === "POST") posts += 1; stored = { ...stored, ...body.content, slug:body.slug || stored.slug, status:body.publish ? "published" : stored.status, updatedAt:new Date(Date.now()+1000).toISOString() }; }
    await route.fulfill({ status: request.method() === "POST" ? 201 : 200, json: request.method() === "GET" && request.url().endsWith("/askouts") ? { askOuts:[stored] } : stored });
  });
  await page.setViewportSize({ width:1366,height:850 }); await page.goto("/askout/create"); await expect(page.getByText("Not saved yet")).toBeVisible(); expect(posts).toBe(0); await page.getByLabel("Recipient name *").fill("Anoli"); await page.getByLabel("Nickname / @tag").fill("@anoli"); await page.getByLabel("Your name *").fill("Dhruv"); await page.getByRole("button", { name:"Next", exact:true }).click();
  await page.getByRole("button", { name:"Cats", exact:true }).click(); await page.getByRole("button", { name:"Next", exact:true }).click(); await page.getByLabel("Date *").fill("2027-01-03"); await page.getByLabel("Pickup time *").fill("19:00"); await page.getByLabel("Destination / date location *").fill("The Reading Room"); await page.getByLabel("Map address *").fill("12 Book Street"); await page.getByLabel("Activity / plan *").fill("Bookstore + coffee");
  await page.getByRole("button", { name:"Next", exact:true }).click(); await page.getByRole("button", { name:/Cat Investigation/ }).click(); await page.getByText("Playful Yes-Only Journey", { exact:true }).click(); await expect(page.getByText(/Playful journey mode enabled/)).toBeVisible(); await expect(page.getByRole("radio", { name:"Mischievous" })).toBeChecked(); await page.getByRole("button", { name:"Make drier" }).click(); await expect(page.getByLabel("Recurring joke")).toHaveValue("The investigator has no relevant qualifications."); await page.getByRole("button", { name:"Next", exact:true }).click(); await page.getByRole("button", { name:"Publish Ask Out" }).click();
  await expect(page.getByText("Your Ask Out is ready.")).toBeVisible(); await page.waitForURL(/id=/); expect(posts).toBe(1); expect(stored.status).toBe("published"); expect(stored.destination).toBe("The Reading Room"); await expect(page.getByRole("link", { name:"Preview" })).toHaveAttribute("href", /\/askout\//);
  await page.reload(); await expect(page.getByLabel("Recipient name *")).toHaveValue("Anoli"); await expect(page.getByText("Published")).toBeVisible(); expect(posts).toBe(1);
});
test("authenticated dashboard keeps Ask Outs separate and shows response status", async ({ page }) => {
  const item: AskOut = { ...EMPTY_ASK_OUT, recipientName:"Anoli", creatorName:"Dhruv", date:"2027-01-03", weekday:"Sunday", pickupTime:"19:00", destination:"The Reading Room", mapAddress:"12 Book Street", activity:"Coffee", dayOptions:funnyDayOptions("Sunday"), id:"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", slug:"anoli-x7k2", status:"published", createdAt:"2026-09-08T12:00:00.000Z", updatedAt:"2026-09-08T12:00:00.000Z", responses:{ viewed:5,started:4,tell_more:1,accepted:1,declined:2 }, latestResponse:{ response:"accepted", selectedDayOption:"Day after Saturday", selectedActivity:"Coffee", respondedAt:"2026-09-08T13:00:00.000Z" } };
  await page.route("**/api/askouts", route => route.fulfill({ json:{ askOuts:[item] } })); await page.goto("/dashboard/askouts");
  await expect(page.getByRole("heading", { name:"Ask Outs", exact:true })).toBeVisible(); await expect(page.getByRole("heading", { name:"Anoli" })).toBeVisible(); await expect(page.getByText(/1 accepted · 2 declined · 1 asked for more/)).toBeVisible();
  await expect(page.getByRole("link", { name:"Edit" })).toHaveAttribute("href", `/askout/create?id=${item.id}`); await expect(page.getByRole("link", { name:"Preview" })).toHaveAttribute("href", `/askout/${item.slug}`);
});
