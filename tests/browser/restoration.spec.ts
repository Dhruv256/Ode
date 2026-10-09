import {test,expect} from '@playwright/test';
import {ALL_TEMPLATES} from '../../src/lib/templates';
import { personalAnswers, recipientQuestion } from '../../src/lib/personalization';
import { templateFixture } from '../../src/lib/templateFixture';
import { HAMPER_THEMES, HAMPER_ITEM_REGISTRY, HAMPER_MESSAGE_FIELD, hamperFieldLabel } from '../../src/features/hamper/config';
import { fixtureHamper } from '../fixtures';

for(const width of [1440,390])for(const template of ALL_TEMPLATES)test(`${template.id}: ${width}px keeps stable recipient context and historical answers`,async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const variant of ['context','legacy']){
    await page.goto(`/qa/templates?template=${template.id}&photos=12&case=${variant}`);
    await expect(page.locator('.tp-personalization')).toBeVisible();
    const reading=page.locator('details.tp-reading-copy');
    if(await reading.count())await reading.locator('summary').click();
    const answers=personalAnswers(templateFixture(template.id,12,variant).memories);
    const notes=page.locator('.tp-personalization .tp-notes-grid [data-personalization-key]');
    await expect(notes).toHaveCount(answers.length);
    for(const answer of answers){
      const pair=notes.filter({has:page.locator(`dt`,{hasText:answer.question})});
      await expect(pair).toHaveCount(1);
      expect(await pair.locator('dd').textContent()).toBe(answer.answer);
    }
    for(const pair of await page.locator('.tp-personal-answer[data-personalization-key]').all()){
      const key=await pair.getAttribute('data-personalization-key');
      expect(await pair.locator(':scope > .tp-question').textContent()).toBe(recipientQuestion(key));
      expect(await pair.locator(':scope > .tp-answer').textContent()).toBeTruthy();
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    expect(await page.locator('.birthday-template').innerText()).not.toContain('undefined');
  }
});

for(const theme of Object.keys(HAMPER_THEMES))test(`Hamper ${theme}: each keepsake uses its editor field context`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:844});
  await page.goto(`/qa/hamper?theme=${theme}&style=scene`);
  for(let stage=1;stage<=3;stage++)await page.getByRole('button',{name:new RegExp(`tap ${stage} of 3`)}).click();
  const message=page.locator('[data-hamper-field="message"]');
  await expect(message.locator('small')).toHaveText(HAMPER_MESSAGE_FIELD.recipientLabel);
  expect(await message.locator(':scope > span').textContent()).toBe(fixtureHamper().message);
  for(const item of fixtureHamper().items){
    await page.locator(`button[data-type=${item.type}]`).click();
    if(item.type==='gift')await page.getByRole('button',{name:/Pull the ribbon/}).click();
    const dialog=page.getByRole('dialog');
    const expected=HAMPER_ITEM_REGISTRY[item.type].fields.filter(field=>!['url','expiry'].includes(field.key)&&typeof(item.payload as unknown as Record<string,unknown>)[field.key]==='string'&&String((item.payload as unknown as Record<string,string>)[field.key]).trim());
    await expect(dialog.locator('[data-hamper-field]')).toHaveCount(expected.length);
    for(const pair of await dialog.locator('[data-hamper-field]').all()){
      const field=(await pair.getAttribute('data-hamper-field'))!.split('.')[1];
      expect(await pair.locator(':scope > small').textContent()).toBe(hamperFieldLabel(item.type,field));
      expect(await pair.locator(':scope > span').textContent()).toBe((item.payload as unknown as Record<string,string>)[field]);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await page.getByRole('button',{name:'Close',exact:true}).click();
  }
});

for(const width of [1440,390]) for(const template of ALL_TEMPLATES) {
  test(`${template.id}: ${width}px handles empty, long, short and 75-photo gifts`,async({page})=>{
    test.setTimeout(90000);
    await page.setViewportSize({width,height:900});
    await page.emulateMedia({reducedMotion:'reduce'});
    const errors:string[]=[];
    page.on('pageerror',error=>errors.push(error.message));
    for(const [variant,photos] of [['empty',0],['short',1],['long',12],['normal',75]] as const) {
      await page.goto(`/qa/templates?template=${template.id}&photos=${photos}&case=${variant}`);
      await expect(page.locator('.birthday-template')).toHaveAttribute('data-template',template.id);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await expect(page.locator('footer')).toContainText(variant==='empty' ? /./ : /next chapter, together/i);
      const collection=page.locator('details.tp-collection');
      if(photos>1) {
        await collection.locator('summary').click();
        const ids=await page.locator('.tp-high-photo-grid [data-photo-id]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-photo-id')));
        expect(new Set(ids).size).toBe(photos);
        await collection.locator('summary').click();
      }
      expect(await page.locator('.birthday-template').innerText()).not.toMatch(/\bundefined\b|\[object Object\]/);
    }
    expect(errors).toEqual([]);
  });
}

test('final message starts on its own entrance and preserves exact words',async({page})=>{
  await page.goto('/qa/templates?template=contact-sheet&photos=12');
  const ending=page.locator('footer .tp-message');
  await expect(ending).toHaveAttribute('data-message-started','false');
  await ending.scrollIntoViewIfNeeded();
  await expect(ending).toHaveAttribute('data-message-started','true');
  await expect(ending.locator('.sr-only')).toHaveText('Here’s to the next chapter, together.');
  const words=ending.locator('.tp-message-unit');
  const delays=await words.evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).transitionDelay));
  expect(new Set(delays).size).toBeGreaterThan(1);
  await expect.poll(()=>words.last().evaluate(node=>Number(getComputedStyle(node).opacity))).toBe(1);
  await expect(words.last()).toHaveCSS('filter','none');
});

test('recipient context precedes the answer and multiline finales keep readable line spacing',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/qa/templates?template=after-dark&photos=12&case=context');
  const pair=page.locator('footer .tp-personal-answer');
  await expect(pair).toHaveAttribute('data-context-entered','false');
  await pair.scrollIntoViewIfNeeded();
  await expect(pair).toHaveAttribute('data-context-entered','true');
  await expect(pair.locator('.tp-question')).toHaveText(recipientQuestion('ending-line')!);
  expect(await pair.locator('>.tp-answer').evaluate(node=>{const style=getComputedStyle(node);return parseFloat(style.lineHeight)/parseFloat(style.fontSize);})).toBeGreaterThanOrEqual(1.15);
  const delay=await pair.locator('>.tp-answer').evaluate(node=>parseFloat(getComputedStyle(node).animationDelay));
  expect(delay).toBeGreaterThan(0);
  const word=pair.locator('.tp-message-unit').first();
  expect(await word.evaluate(node=>parseFloat(getComputedStyle(node).transitionDelay))).toBeGreaterThan(delay);
  await expect.poll(()=>word.evaluate(node=>Number(getComputedStyle(node).opacity))).toBe(1);
});

test('mixed photo carousel keeps its frame stable and manual reading pauses autoplay',async({page})=>{
  await page.goto('/qa/templates?template=internet-person&photos=12');
  const carousel=page.getByRole('region',{name:'Saved photo files'});
  await expect(carousel).toBeVisible();
  const next=carousel.getByRole('button',{name:/Next/});
  const frame=carousel.locator('.tp-frame').first();
  const heights:number[]=[];
  // Layout height stays fixed; the template's entrance scale may change its visual bounds.
  for(let i=0;i<7;i++) {heights.push(await frame.evaluate(node=>(node as HTMLElement).offsetHeight));await next.click();}
  expect(Math.max(...heights)-Math.min(...heights)).toBeLessThan(2);
  await expect(carousel.getByRole('button',{name:'Play slideshow'})).toBeVisible();
});

test('Digital Hamper entry leads to the existing creator and page has defensive headers',async({page})=>{
  const response=await page.goto('/');
  expect(response!.headers()['x-content-type-options']).toBe('nosniff');
  expect(response!.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  const hamper=page.locator('#hampers');
  const cta=hamper.getByRole('link',{name:/hamper/i});
  await expect(cta).toHaveAttribute('href','/dashboard/hamper/new');
  await page.route('**/api/hampers**',route=>route.fulfill({json:{id:'a0000000-0000-4000-8000-000000000001',hampers:[]}}));
  await cta.click();
  await expect(page).toHaveURL(/\/dashboard\/hamper\/new/);
});

for(const template of ['contact-sheet','cut-and-paste','archive','yearbook']) {
  test(`${template}: its native reveal responds to keyboard and closes again`,async({page})=>{
    await page.goto(`/qa/templates?template=${template}&photos=12`);
    const reveal=page.locator('.birthday-template button[aria-expanded]').first();
    if(template==='yearbook') for(let turn=0;turn<12 && await reveal.count()===0;turn++) await page.getByRole('group',{name:'Interactive yearbook spreads controls',exact:true}).getByRole('button',{name:'Next item'}).click();
    await expect(reveal).toHaveAttribute('aria-expanded','false');
    await reveal.press('Enter');
    await expect(reveal).toHaveAttribute('aria-expanded','true');
    await reveal.press('Enter');
    await expect(reveal).toHaveAttribute('aria-expanded','false');
  });
}

for(const template of ['polaroid-wall','dreamscape']) {
  test(`${template}: full photo preserves focus and Escape closes its dialog`,async({page})=>{
    await page.goto(`/qa/templates?template=${template}&photos=12`);
    const opener=template==='dreamscape' ? page.locator('button.tp-portal').first() : page.locator('.birthday-template button').filter({has:page.locator('[data-photo-id]')}).first();
    await opener.click();
    const dialog=page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('img')).toHaveCSS('object-fit','contain');
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button',{name:'Close photo ×'})).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  });
}

test('Sunday Morning folded note opens without shifting into an empty photo section',async({page})=>{
  await page.goto('/qa/templates?template=sunday-morning&photos=0');
  const folded=page.locator('details.tp-folded-note');
  await folded.locator('summary').press('Enter');
  await expect(folded).toHaveAttribute('open','');
  await expect(folded).toContainText('disastrous detour');
});

test('unauthenticated creator APIs fail closed in QA, without touching storage',async({request})=>{
  for(const path of ['/api/websites','/api/hampers','/api/askouts']) {
    const response=await request.get(path); expect(response.status()).toBe(401);
  }
  const upload=await request.post('/api/media/sign',{data:{projectId:'synthetic',fileName:'test.svg',contentType:'image/svg+xml',kind:'image',sizeBytes:100}});
  expect(upload.status()).toBe(401);
});
