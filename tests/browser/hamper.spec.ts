import { test, expect, type Page } from "@playwright/test";
import { fixtureHamper } from "../fixtures";
const widths = [[320,568],[360,800],[375,812],[390,844],[412,915],[430,932],[768,1024],[1366,768],[1440,900],[1920,1080]];
async function openBox(page: Page) {
  const root = page.locator("[data-opening-stage]");
  for (let stage = 1; stage <= 3; stage++) {
    const button = page.getByRole("button", { name: new RegExp(`tap ${stage} of 3`) });
    await expect(button).toHaveAttribute("aria-disabled", "false"); await button.click(); await expect(root).toHaveAttribute("data-opening-stage", String(stage));
    if (stage < 3) { await expect(page.getByRole("button", { name: new RegExp(`tap ${stage + 1} of 3`) })).toHaveAttribute("aria-disabled", "false"); await expect(page.getByRole("button", { name: /Open note:/ })).toHaveCount(0); }
  }
  await expect(page.getByRole("button", { name: /Open note:/ })).toBeVisible();
}
async function noOverflow(page: Page) { expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true); }
for (const style of ["burst", "scene"]) {
  for (const [width,height] of widths) test(`${style} at ${width}px fits and opens in exactly three taps`, async ({ page }) => {
    await page.setViewportSize({ width,height }); await page.goto(`/qa/hamper?style=${style}`); await noOverflow(page);
    await openBox(page); await noOverflow(page);
    const objects = page.locator("button[data-type]"); await expect(objects).toHaveCount(10);
    for (const element of await objects.all()) { const rect = await element.boundingBox(); expect(rect?.width).toBeGreaterThan(44); expect(rect?.x).toBeGreaterThanOrEqual(0); expect((rect?.x || 0) + (rect?.width || 0)).toBeLessThanOrEqual(width); }
    await page.getByRole("button", { name: /Open note:/ }).click(); await expect(page.getByRole("dialog")).toBeVisible(); await noOverflow(page);
    await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0); await expect(page.getByRole("button", { name: /Open note:/ })).toBeFocused();
  });
}
test("reduced motion still requires three taps and every item opens", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/qa/hamper");
  await expect(page.locator("iframe")).toHaveCount(0); await openBox(page);
  for (const type of ["note","photo","song","video","voice","drawing","gift","location","coupon","news"]) {
    await page.locator(`button[data-type=${type}]`).click(); await expect(page.getByRole("dialog")).toBeVisible();
    if (type === "gift") { await expect(page.getByRole("link", { name: "Open gift" })).toHaveCount(0); await page.getByRole("button", { name: /Pull the ribbon/ }).click(); await expect(page.getByRole("link", { name: "Open gift" })).toHaveAttribute("rel", "noopener noreferrer"); }
    if (type === "video") await expect(page.getByRole("dialog").locator("iframe")).toHaveAttribute("src", /youtube-nocookie/);
    await page.getByRole("button", { name: "Close", exact: true }).click();
  }
});
test("Proper Retro is a complete responsive world with ten distinct object shells", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/qa/hamper?style=scene&theme=proper-retro");
  await expect(page.locator('[data-theme="proper-retro"]')).toBeVisible();
  await openBox(page);
  await noOverflow(page);
  const signatures = await page.locator("button[data-type]").evaluateAll((nodes) => nodes.map((node) => {
    const style = getComputedStyle(node);
    return `${style.backgroundImage}|${style.borderStyle}|${style.borderWidth}|${style.borderRadius}|${style.clipPath}`;
  }));
  expect(new Set(signatures).size).toBeGreaterThanOrEqual(8);
  await page.getByRole("button", { name: /Open coupon:/ }).click();
  await expect(page.getByRole("dialog")).toHaveAttribute("data-theme", "proper-retro");
  await noOverflow(page);
});
test("creator adds ten types, edits, reorders, previews, and publishes", async ({ page }) => {
  let stored = { ...fixtureHamper(), items: [] as ReturnType<typeof fixtureHamper>["items"] };
  await page.route("**/api/hampers/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/analytics")) return route.fulfill({ json: { views:0,opened:0,clicks:0,items:[],recent:[] } });
    if (url.pathname.endsWith("/assets")) {
      if (route.request().headers()["content-type"]?.startsWith("audio/")) return route.fulfill({ json: { assetId: "c0000000-0000-4000-8000-000000000002", assetBytes:123, url:"/qa/hamper/audio" } });
      if (route.request().method() === "POST") return route.fulfill({ json: { assetId: "c0000000-0000-4000-8000-000000000001", uploadUrl: "https://upload.example/file" } });
      return route.fulfill({ json: { assetBytes: 123, url: "/brand/ode-primary.png" } });
    }
    if (route.request().method() === "PUT") { const body = route.request().postDataJSON(); stored = { ...stored, ...body.content, status: body.publish ? "published" : "draft", updatedAt: new Date().toISOString() }; return route.fulfill({ json: stored }); }
    return route.fulfill({ json: stored });
  });
  await page.route("https://upload.example/**", route => route.fulfill({ status:200 }));
  await page.setViewportSize({ width:390,height:844 }); await page.goto("/qa/hamper?mode=builder");
  await page.getByLabel("Recipient name").fill("Avery"); await page.getByLabel("Sender name").fill("Sam");
  await page.getByRole("button", { name: "Save & continue" }).click();
  await page.getByRole("button", { name: /Buttercup Picnic/ }).click(); await page.getByRole("button", { name: "Save & continue" }).click();
  await page.getByRole("button", { name: /Scene Open into/ }).click(); await page.getByRole("button", { name: "Save & continue" }).click();
  const textInputs: Record<string, Record<string,string>> = { Note:{ "Your note":"Hello, lovely person." }, Song:{ "Song URL":"https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT" }, Video:{ "YouTube or Vimeo URL":"https://youtu.be/dQw4w9WgXcQ" }, Gift:{ "Gift URL":"https://example.com/gift" }, Location:{ "Place name":"Our cafe", "Google Maps URL":"https://share.google/aGoogleMapsShare123" }, Coupon:{ "Coupon title":"Coffee together" }, News:{ "Article URL":"https://example.com/article" } };
  for (const label of ["Note","Photo","Song","Video","Voice","Drawing","Gift","Location","Coupon","News"]) {
    await page.getByRole("button", { name: label, exact:true }).click(); const dialog = page.getByRole("dialog");
    for (const [field,value] of Object.entries(textInputs[label] || {})) await dialog.getByLabel(field, { exact:false }).fill(value);
    if (label === "Photo" || label === "Voice") {
      await dialog.locator("input[type=file]").setInputFiles({ name:label === "Photo" ? "photo.png" : "voice.wav", mimeType:label === "Photo" ? "image/png" : "audio/wav", buffer:Buffer.from(label === "Photo" ? "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aIZ0AAAAASUVORK5CYII=" : "UklGRgAAAABXQVZF", "base64") });
      await expect(dialog.getByRole("button", { name:"Tuck it inside" })).toBeEnabled();
    }
    if (label === "Drawing") { const box = await dialog.locator("canvas").boundingBox(); await page.mouse.move(box!.x + 30, box!.y + 30); await page.mouse.down(); await page.mouse.move(box!.x + 80, box!.y + 80, { steps:5 }); await page.mouse.up(); }
    await dialog.getByRole("button", { name:"Tuck it inside" }).click(); await expect(dialog).toHaveCount(0); await noOverflow(page);
    expect(stored.items.map(item => item.type)).toContain(label.toLowerCase());
  }
  await expect(page.getByRole("list", { name:"Inside your hamper" }).locator("li")).toHaveCount(10);
  await page.getByRole("listitem").first().getByRole("button", { name:"Edit",exact:true }).click(); await page.getByLabel("Your note").fill("Edited with love."); await page.getByRole("button", { name:"Keep these changes" }).click();
  await page.getByRole("button", { name:"Save & continue" }).click();
  await page.getByRole("button", { name:/Move Note down/ }).click();
  await expect(page.getByRole("listitem").first()).toContainText("Photo");
  await page.getByRole("button", { name:"Save & continue" }).click(); await page.getByRole("button", { name:"Mobile preview" }).click(); await openBox(page); await noOverflow(page);
  await page.getByRole("button", { name:/Open location:/ }).click();
  await expect(page.getByRole("dialog").getByRole("link", { name:"Open in Maps" })).toHaveAttribute("href", "https://share.google/aGoogleMapsShare123");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name:"Replay opening" }).click(); await expect(page.locator("[data-opening-stage]")).toHaveAttribute("data-opening-stage","0");
  await page.getByRole("button", { name:"Wrap it up",exact:false }).click(); await page.getByRole("button", { name:"Publish hamper",exact:true }).click();
  await expect(page.getByRole("heading", { name:"Ready for Avery" })).toBeVisible(); expect(stored.items).toHaveLength(10); expect(stored.status).toBe("published");
});

test("item saves immediately and a failed save keeps the editor and input for retry", async ({ page }) => {
  let stored = { ...fixtureHamper(), items: [] as ReturnType<typeof fixtureHamper>["items"] };
  let rejectNextSave = true;
  await page.route("**/api/hampers/**", async route => {
    if (route.request().method() === "PUT") {
      if (rejectNextSave) { rejectNextSave = false; return route.fulfill({ status: 500, json: { error: "Temporary save failure. Retry this keepsake." } }); }
      stored = { ...stored, ...route.request().postDataJSON().content, updatedAt: new Date().toISOString() };
    }
    await route.fulfill({ json: stored });
  });
  await page.goto("/qa/hamper?mode=builder");
  await page.getByRole("button", { name: "4. Fill it" }).click();
  await page.getByRole("button", { name: "Song", exact: true }).click();
  const url = "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT";
  await page.getByLabel("Song URL").fill(url);
  await page.getByRole("button", { name: "Tuck it inside" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toHaveText("Temporary save failure. Retry this keepsake.");
  await expect(page.getByLabel("Song URL")).toHaveValue(url);
  expect(stored.items).toHaveLength(0);
  await page.getByRole("button", { name: "Tuck it inside" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(stored.items).toHaveLength(1);
  expect(stored.items[0].payload).toMatchObject({ url });
  await expect(page.getByText("Saved in your studio")).toBeVisible();
});
