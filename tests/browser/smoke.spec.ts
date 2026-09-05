import { test, expect, type Page } from "@playwright/test";
import { fixtureHamper } from "../fixtures";
async function open(page: Page) {
  for(let i=1;i<=3;i++) { const button=page.getByRole("button",{name:new RegExp(`tap ${i} of 3`)}); await expect(button).toHaveAttribute("aria-disabled","false"); await button.click(); }
  await expect(page.getByRole("button",{name:/Open note:/})).toBeVisible();
}
test("four themes, portrait scene, video sizing and voice playback",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const theme of ["soft-parcel","berry-letter","buttercup-picnic","cloud-ribbon"]) {
    await page.goto(`/qa/hamper?style=scene&theme=${theme}`); await open(page);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.getByRole("button",{name:/Open video:/}).click(); const frame=page.getByRole("dialog").locator("iframe"); const box=await frame.boundingBox(); expect(box!.width).toBeLessThan(390); await page.keyboard.press("Escape");
  }
  await page.getByRole("button",{name:/Open voice:/}).click(); await page.getByRole("button",{name:"Play voice note"}).click(); await expect(page.getByRole("button",{name:"Pause voice note"})).toBeVisible(); await page.keyboard.press("Escape");
});
test("touch drawing, pointer reorder, item removal and keyboard navigation",async({page,browserName})=>{
  let stored={...fixtureHamper(),items:[] as ReturnType<typeof fixtureHamper>["items"]};
  await page.route("**/api/hampers/**",async route=>{ if(route.request().method()==="PUT") stored={...stored,...route.request().postDataJSON().content,updatedAt:new Date().toISOString()}; await route.fulfill({json:stored}); });
  await page.setViewportSize({width:360,height:800}); await page.goto("/qa/hamper?mode=builder"); await page.getByRole("button",{name:"4. Fill it"}).click();
  await page.getByRole("button",{name:"Drawing",exact:true}).click(); const canvas=page.locator("canvas"); const rect=await canvas.boundingBox(); await page.touchscreen.tap(rect!.x+40,rect!.y+40); await expect(page.getByRole("button",{name:"Undo",exact:true})).toBeEnabled();
  await page.getByRole("button",{name:"Tuck it inside"}).click();
  for(const title of ["First","Second"]) { await page.getByRole("button",{name:"Note",exact:true}).click(); await page.getByLabel("Little title").fill(title); await page.getByLabel("Your note").fill("A little note."); await page.getByRole("button",{name:"Tuck it inside"}).click(); }
  const list=page.getByRole("list",{name:"Inside your hamper"}); await expect(list.locator("li")).toHaveCount(3);
  if(browserName==="chromium") {
    const handle=page.getByRole("button",{name:"Drag First",exact:true}); await handle.scrollIntoViewIfNeeded();
    const from=await handle.boundingBox(),to=await page.getByRole("button",{name:"Drag Second",exact:true}).boundingBox();
    const cdp=await page.context().newCDPSession(page); const x=from!.x+20,y=from!.y+20,target=to!.y+to!.height;
    await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y}]});
    for(let i=1;i<=10;i++) await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x,y:y+(target-y)*i/10}]});
    await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]}); await cdp.detach();
    await expect(list.locator("li").last()).toContainText("First");
  }
  await list.locator("li").last().getByRole("button",{name:"Remove",exact:true}).click(); await expect(list.locator("li")).toHaveCount(2);
  await page.getByRole("button",{name:"5. Arrange"}).click(); await page.getByRole("button",{name:/Move Drawing down/}).press("Enter"); await expect(list.locator("li").last()).toContainText("Drawing");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test("birthday dashboard has separate projects and the creator logo returns home",async({page})=>{
  await page.route("**/api/websites**",route=>route.fulfill({json:{websites:[]}})); await page.route("**/api/hampers",route=>route.fulfill({json:{hampers:[]}}));
  await page.setViewportSize({width:1366,height:768}); await page.goto("/dashboard"); await expect(page.getByRole("heading",{name:"What are we making?"})).toBeVisible();
  await page.getByRole("link",{name:/Create a birthday website/}).click(); await expect(page.getByRole("link",{name:"Ode dashboard",exact:true})).toHaveAttribute("href","/dashboard");
  await page.getByRole("link",{name:"Ode dashboard",exact:true}).click(); await expect(page.getByRole("heading",{name:"What are we making?"})).toBeVisible();
  await page.goto("/"); await expect(page.getByRole("heading",{name:/Digital hampers/i})).toHaveCount(0);
});
test("records a synthetic voice note, pauses, previews and re-records",async({page,browserName})=>{
  test.skip(browserName!=="chromium","WebKit on Windows has no synthetic microphone source.");
  await page.context().grantPermissions(["microphone"]);
  await page.route("**/api/hampers/**", route => route.fulfill({ json: { ...fixtureHamper(), ...route.request().postDataJSON()?.content, updatedAt: new Date().toISOString() } }));
  await page.route("**/api/hampers/**/assets",route=>route.fulfill({json:{assetId:"c0000000-0000-4000-8000-000000000002",assetBytes:1024,url:"/qa/hamper/audio"}}));
  await page.goto("/qa/hamper?mode=builder"); await page.getByRole("button",{name:"4. Fill it"}).click(); await page.getByRole("button",{name:"Voice",exact:true}).click();
  await page.getByRole("button",{name:"Record a voice note"}).click(); await expect(page.getByRole("button",{name:/Stop · [1-9]/})).toBeVisible();
  await page.getByRole("button",{name:"Pause",exact:true}).click(); await page.getByRole("button",{name:"Resume",exact:true}).click(); await page.getByRole("button",{name:/Stop ·/}).click();
  await expect(page.getByRole("button",{name:"Play voice note"})).toBeVisible();
  await page.getByRole("button",{name:"Record a voice note"}).click(); await expect(page.getByRole("button",{name:/Stop · [1-9]/})).toBeVisible(); await page.getByRole("button",{name:/Stop ·/}).click(); await expect(page.getByRole("button",{name:"Play voice note"})).toBeVisible();
  await page.getByRole("button",{name:"Tuck it inside"}).click(); await expect(page.getByRole("listitem")).toHaveCount(1);
});

test("birthday creator can clear every photo with confirmation",async({page})=>{
  await page.route("**/api/websites",route=>route.fulfill({json:{id:"photo-clear-qa"}}));
  await page.goto("/create?new=1");
  await page.getByRole("button",{name:/For a her/}).click();
  await page.getByLabel("Their full name").fill("Photo QA");
  await page.getByRole("button",{name:/Continue → Their World/}).click();
  await page.getByRole("button",{name:/Main Character/}).click();
  await page.getByRole("button",{name:/Continue → Style/}).click();
  await page.getByRole("button",{name:/Use Contact Sheet/}).click();
  await page.getByRole("button",{name:/Continue → Age/}).click();
  await page.getByRole("button",{name:/25/}).first().click();
  await page.getByRole("button",{name:/Continue → Color/}).click();
  await page.locator("section ul button").first().click();
  await page.getByRole("button",{name:/Continue → Photos/}).click();
  const pixel=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aIZ0AAAAASUVORK5CYII=","base64");
  await page.locator('input[type="file"]').setInputFiles([{name:"one.png",mimeType:"image/png",buffer:pixel},{name:"two.png",mimeType:"image/png",buffer:pixel}]);
  await expect(page.getByRole("button",{name:"Clear all 2"})).toBeVisible();
  await page.getByRole("button",{name:"Clear all 2"}).click();
  const dialog=page.getByRole("alertdialog",{name:"Clear all photos"}); await expect(dialog).toContainText("Remove all 2 photos");
  await dialog.getByRole("button",{name:"Keep photos"}).click(); await expect(dialog).toHaveCount(0); await expect(page.getByRole("button",{name:"Clear all 2"})).toBeVisible();
  await page.getByRole("button",{name:"Clear all 2"}).click(); await page.getByRole("button",{name:"Delete all photos"}).click();
  await expect(page.getByRole("button",{name:/Clear all/})).toHaveCount(0); await expect(page.getByText(/8–12 photos feels intimate/)).toBeVisible();
});
