import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const out = path.resolve('audit-output/teaching-mode');
fs.mkdirSync(out, { recursive: true });

const sizes = [
  [390,844], [768,1024], [1024,768], [1280,720], [1366,768], [1600,900], [1920,1080],
];

let projection = {
  stepIndex: 1,
  releasedStepIndex: 1,
  steps: [
    { title: 'Bellwork', body: 'Look closely. What do you notice first?' },
    { title: 'Demo', body: 'Watch the process, then name the one move you want to try.' },
    { title: 'Studio', body: 'Work for fifteen minutes. Pause only if you need a material or a question answered.' },
    { title: 'Cleanup', body: 'Return tools, wipe the table, and leave your work ready for next time.' },
  ],
  roomMode: 'live',
  clockVisible: true,
  timer: { active: true, kind: 'normal', endsAt: new Date(Date.now()+9*60000).toISOString(), label: 'Timer' },
  pass: { active: false, publicLabel: 'AVAILABLE', startedAt: null },
  layout: { pass: 'bottom-left', clock: 'top-right', progress: 'top' },
};

const browser = await chromium.launch({ headless: true });
let failures = [];
let evidence = [];

for (const [width,height] of sizes) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.route('**/functions/v1/teaching-session', async route => {
    const session = {
      id:'audit-session', room_code:'GOLD42', channel_key:'audit-key', expires_at:new Date(Date.now()+3600000).toISOString(),
      room_projection: projection,
    };
    await route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({session}) });
  });
  await page.goto('http://127.0.0.1:4173/teaching-room.html', { waitUntil:'networkidle' });
  await page.fill('#roomCode','GOLD42');
  await page.click('button:has-text("Join room")');
  await page.waitForSelector('#room.active');

  const assertLayout = async (label) => {
    const result = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      sh: document.documentElement.scrollHeight,
      iw: innerWidth,
      ih: innerHeight,
      titleRect: document.querySelector('#title')?.getBoundingClientRect().toJSON(),
      timerRect: document.querySelector('#timer:not([hidden])')?.getBoundingClientRect().toJSON() || null,
      clockRect: document.querySelector('#clock:not([hidden])')?.getBoundingClientRect().toJSON() || null,
      passRect: document.querySelector('#pass')?.getBoundingClientRect().toJSON(),
    }));
    const overflow = result.sw > result.iw + 1 || result.sh > result.ih + 1;
    if (overflow) failures.push(`${width}x${height} ${label}: document overflow ${result.sw}x${result.sh}`);
    const rects = [result.titleRect,result.timerRect,result.clockRect,result.passRect].filter(Boolean);
    for (const r of rects) if (r.x < -1 || r.y < -1 || r.x+r.width > result.iw+1 || r.y+r.height > result.ih+1) failures.push(`${width}x${height} ${label}: critical element clipped`);
    if (result.timerRect && result.clockRect) {
      const a=result.timerRect,b=result.clockRect;
      const collide=!(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y);
      if (collide) failures.push(`${width}x${height} ${label}: timer/clock collision`);
    }
  };

  await assertLayout('live');
  const liveFile = path.join(out,`student-live-${width}x${height}.png`);
  await page.screenshot({ path: liveFile, fullPage:false });
  evidence.push(path.basename(liveFile));

  projection = { ...projection, roomMode:'held' };
  await page.waitForTimeout(1000);
  await assertLayout('held');
  const heldFile = path.join(out,`student-held-${width}x${height}.png`);
  await page.screenshot({ path: heldFile, fullPage:false });
  evidence.push(path.basename(heldFile));

  for (const mode of ['paused','blank']) {
    projection = { ...projection, roomMode: mode };
    await page.waitForTimeout(1000);
    const black = await page.evaluate(() => {
      const el=document.querySelector('#blank');
      const r=el.getBoundingClientRect();
      const bg=getComputedStyle(el).backgroundColor;
      const visibleConnection=getComputedStyle(document.querySelector('#connection')).display !== 'none';
      return {bg,x:r.x,y:r.y,w:r.width,h:r.height,iw:innerWidth,ih:innerHeight,visibleConnection,children:el.childElementCount,text:el.textContent.trim()};
    });
    if (black.bg !== 'rgb(0, 0, 0)' || Math.abs(black.w-black.iw)>1 || Math.abs(black.h-black.ih)>1 || black.x!==0 || black.y!==0 || black.visibleConnection || black.children!==0 || black.text!=='') {
      failures.push(`${width}x${height} ${mode}: pure-black contract failed ${JSON.stringify(black)}`);
    }
    const file = path.join(out,`student-${mode}-${width}x${height}.png`);
    await page.screenshot({ path:file, fullPage:false });
    evidence.push(path.basename(file));
  }

  await page.emulateMedia({ reducedMotion:'reduce' });
  projection = { ...projection, roomMode:'live' };
  await page.waitForTimeout(1000);
  const reduce = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (!reduce) failures.push(`${width}x${height}: reduced-motion emulation not active`);

  await page.close();
}

await browser.close();

const report = {
  generatedAt:new Date().toISOString(),
  status: failures.length ? 'FAIL' : 'PASS',
  scope:'student-facing classroom display rendered production build',
  sizes:sizes.map(([w,h])=>`${w}x${h}`),
  states:['live','held','paused','blank','reduced-motion'],
  evidence,
  failures,
  note:'Teacher-facing rendered Gold audit remains a separate required gate and is not satisfied by this script.'
};
fs.writeFileSync(path.join(out,'render-audit.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if (failures.length) process.exit(1);
