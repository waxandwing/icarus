import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const base = 'http://127.0.0.1:43217';
const out = 'artifacts/visual-qa';
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function capture(page, path) {
  await page.screenshot({ path, fullPage: false });
}

function assertSameBox(before, after, label) {
  if (!before || !after) throw new Error(`${label}: calendar shell bounding box is missing.`);
  for (const key of ['x', 'y', 'width', 'height']) {
    if (Math.abs(before[key] - after[key]) > 0.5) {
      throw new Error(
        `${label}: opening furniture changed calendar ${key} from ${before[key]} to ${after[key]}.`,
      );
    }
  }
}

async function assertClosedFurnitureHidden(page) {
  const state = await page.evaluate(() => {
    const ids = ['arc-settings-panel', 'arc-fridge-panel', 'arc-taskbar-panel'];
    return Object.fromEntries(
      ids.map((id) => {
        const element = document.getElementById(id);
        return [id, element ? getComputedStyle(element).visibility : 'missing'];
      }),
    );
  });
  for (const [id, visibility] of Object.entries(state)) {
    if (visibility !== 'hidden') throw new Error(`${id} is ${visibility} while closed; expected hidden.`);
  }
}

async function assertOpenFurnitureVisible(page) {
  const state = await page.evaluate(() => {
    const ids = ['arc-settings-panel', 'arc-fridge-panel', 'arc-taskbar-panel'];
    return Object.fromEntries(
      ids.map((id) => {
        const element = document.getElementById(id);
        return [id, element ? getComputedStyle(element).visibility : 'missing'];
      }),
    );
  });
  for (const [id, visibility] of Object.entries(state)) {
    if (visibility !== 'visible') throw new Error(`${id} is ${visibility} while open; expected visible.`);
  }
}

async function openFurniture(page) {
  await page.click('#arc-settings-tab');
  await page.click('#arc-fridge-tab');
  await page.click('#arc-taskbar-tab');
  await page.waitForTimeout(650);
}

async function verifyDateSelection(page) {
  const dateButton = page.locator('button[data-today="true"]');
  await dateButton.click();
  await page.getByRole('toolbar', { name: /Actions for/i }).getByRole('button', { name: 'Add to this day' }).waitFor();
  if ((await dateButton.getAttribute('aria-pressed')) !== 'true') {
    throw new Error('Selected calendar date did not expose aria-pressed=true.');
  }
  await capture(page, `${out}/week-1440-date-selected.png`);
  await page.keyboard.press('Escape');
}

async function captureDesktop() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await assertClosedFurnitureHidden(page);
  const before = await page.locator('#arc-calendar-surface').boundingBox();
  await capture(page, `${out}/week-1440-closed.png`);

  await verifyDateSelection(page);

  await openFurniture(page);
  await assertOpenFurnitureVisible(page);
  const after = await page.locator('#arc-calendar-surface').boundingBox();
  assertSameBox(before, after, '1440 desktop');
  await capture(page, `${out}/week-1440-all-open.png`);

  await context.close();
}

async function captureMedium() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await assertClosedFurnitureHidden(page);
  const before = await page.locator('#arc-calendar-surface').boundingBox();
  await capture(page, `${out}/week-1280-closed.png`);
  await openFurniture(page);
  await assertOpenFurnitureVisible(page);
  const after = await page.locator('#arc-calendar-surface').boundingBox();
  assertSameBox(before, after, '1280 desktop');
  await capture(page, `${out}/week-1280-all-open.png`);
  await context.close();
}

async function captureMobile() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await assertClosedFurnitureHidden(page);
  await capture(page, `${out}/week-390.png`);
  await context.close();
}

async function captureZoom() {
  // A 640 CSS-pixel viewport at DPR 2 represents a 1280px-wide display at
  // 200% effective zoom while still exercising the responsive/reflow rules.
  const context = await browser.newContext({ viewport: { width: 640, height: 400 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await assertClosedFurnitureHidden(page);
  await capture(page, `${out}/week-200-percent.png`);
  await context.close();
}

async function captureForcedColors() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, forcedColors: 'active' });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await assertClosedFurnitureHidden(page);
  await capture(page, `${out}/week-forced-colors.png`);
  await context.close();
}

await captureDesktop();
await captureMedium();
await captureMobile();
await captureZoom();
await captureForcedColors();
await browser.close();
