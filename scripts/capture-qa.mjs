import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const base = 'http://127.0.0.1:43217';
const out = 'artifacts/visual-qa';
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function capture(page, path) {
  await page.screenshot({ path, fullPage: false });
}

async function openFurniture(page) {
  await page.click('#arc-settings-tab');
  await page.click('#arc-fridge-tab');
  await page.click('#arc-taskbar-tab');
  await page.waitForTimeout(650);
}

async function captureDesktop() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await capture(page, `${out}/week-1440-closed.png`);

  await openFurniture(page);
  await capture(page, `${out}/week-1440-all-open.png`);

  await context.close();
}

async function captureMedium() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await capture(page, `${out}/week-1280-closed.png`);
  await openFurniture(page);
  await capture(page, `${out}/week-1280-all-open.png`);
  await context.close();
}

async function captureMobile() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await capture(page, `${out}/week-390.png`);
  await context.close();
}

async function captureZoom() {
  // A 640 CSS-pixel viewport at DPR 2 represents a 1280px-wide display at
  // 200% effective zoom while still exercising the responsive/reflow rules.
  const context = await browser.newContext({ viewport: { width: 640, height: 400 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await capture(page, `${out}/week-200-percent.png`);
  await context.close();
}

async function captureForcedColors() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, forcedColors: 'active' });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await capture(page, `${out}/week-forced-colors.png`);
  await context.close();
}

await captureDesktop();
await captureMedium();
await captureMobile();
await captureZoom();
await captureForcedColors();
await browser.close();
