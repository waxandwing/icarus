import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const base = 'http://127.0.0.1:43217';
const out = 'artifacts/visual-qa';
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function captureDesktop() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${out}/week-1440-closed.png`, fullPage: true });

  await page.click('#arc-settings-tab');
  await page.click('#arc-fridge-tab');
  await page.click('#arc-taskbar-tab');
  await page.screenshot({ path: `${out}/week-1440-all-open.png`, fullPage: true });

  await context.close();
}

async function captureMedium() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${out}/week-1280-closed.png`, fullPage: true });
  await page.click('#arc-settings-tab');
  await page.click('#arc-fridge-tab');
  await page.click('#arc-taskbar-tab');
  await page.screenshot({ path: `${out}/week-1280-all-open.png`, fullPage: true });
  await context.close();
}

async function captureMobile() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${out}/week-390.png`, fullPage: true });
  await context.close();
}

async function captureZoom() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2';
  });
  await page.screenshot({ path: `${out}/week-200-percent.png`, fullPage: true });
  await context.close();
}

async function captureForcedColors() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, forcedColors: 'active' });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${out}/week-forced-colors.png`, fullPage: true });
  await context.close();
}

await captureDesktop();
await captureMedium();
await captureMobile();
await captureZoom();
await captureForcedColors();
await browser.close();
