import { chromium } from '@playwright/test';

const targets = [
  ['teacher-app', 'http://127.0.0.1:4173/'],
  ['student-display', 'http://127.0.0.1:4173/teaching-room.html'],
];
const failures = [];
const browser = await chromium.launch({ headless: true });

for (const [name, url] of targets) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const badResponses = [];
  page.on('response', (response) => {
    if (/teaching-fonts\.css|\/fonts\/.*\.woff2/i.test(response.url()) && response.status() !== 200) {
      badResponses.push(`${response.status()} ${response.url()}`);
    }
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  const result = await page.evaluate(async () => {
    await document.fonts.ready;
    const inter = await document.fonts.load('400 16px "Inter"');
    const interBold = await document.fonts.load('800 16px "Inter"');
    const spartan = await document.fonts.load('800 32px "League Spartan"');
    const spartanBlack = await document.fonts.load('900 32px "League Spartan"');
    return {
      inter: inter.length,
      interBold: interBold.length,
      spartan: spartan.length,
      spartanBlack: spartanBlack.length,
      checkInter: document.fonts.check('400 16px "Inter"'),
      checkSpartan: document.fonts.check('800 32px "League Spartan"'),
    };
  });
  if (!result.inter || !result.interBold || !result.spartan || !result.spartanBlack || !result.checkInter || !result.checkSpartan) {
    failures.push(`${name}: constitutional fonts did not resolve ${JSON.stringify(result)}`);
  }
  failures.push(...badResponses.map((entry) => `${name}: font request failed ${entry}`));
  await page.close();
}

await browser.close();
console.log(JSON.stringify({ status: failures.length ? 'FAIL' : 'PASS', targets: targets.map(([name]) => name), failures }, null, 2));
if (failures.length) process.exit(1);
