import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const out = path.resolve('audit-output/teaching-mode');
fs.mkdirSync(out, { recursive: true });

const sizes = [
  [390,844], [768,1024], [1024,768], [1280,720], [1366,768], [1600,900], [1920,1080],
];

const failures = [];
const evidence = [];
const privacyLeaks = [];

const browser = await chromium.launch({ headless: true });

function fakeSession(roomProjection) {
  return {
    id: 'audit-session',
    room_code: 'GOLD42',
    channel_key: 'audit-key',
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    room_projection: roomProjection,
  };
}

for (const [width, height] of sizes) {
  const page = await browser.newPage({ viewport: { width, height } });
  let currentProjection = null;
  let currentPass = null;

  await page.route('**/functions/v1/teaching-session', async (route) => {
    let body = {};
    try { body = route.request().postDataJSON(); } catch {}

    if (body.roomProjection) {
      currentProjection = body.roomProjection;
      const projected = JSON.stringify(body.roomProjection);
      if (/private gold note|Mia|Rivera|student-a/i.test(projected)) {
        privacyLeaks.push(`${width}x${height}: private teacher/student data entered roomProjection`);
      }
    }

    let payload;
    switch (body.action) {
      case 'start':
        currentProjection = body.roomProjection;
        payload = { session: fakeSession(currentProjection), class: null };
        break;
      case 'roster':
        payload = {
          class: { id: 'class-a', name: 'Period 2', arc_section_id: body.sectionId || null },
          roster: [
            { enrollmentId: 'enroll-a', studentId: 'student-a', firstName: 'Mia', lastName: 'Rivera', preferredName: 'Mia' },
            { enrollmentId: 'enroll-b', studentId: 'student-b', firstName: 'Noah', lastName: 'Chen', preferredName: null },
          ],
        };
        break;
      case 'active_passes':
        payload = { passes: currentPass ? [currentPass] : [] };
        break;
      case 'update':
        currentProjection = body.roomProjection;
        payload = { session: fakeSession(currentProjection) };
        break;
      case 'pass_start':
        currentPass = {
          id: 'pass-a', student_id: body.studentId, departed_at: new Date().toISOString(), returned_at: null, status: 'out',
        };
        payload = { pass: currentPass };
        break;
      case 'pass_return':
        payload = { pass: { ...currentPass, returned_at: new Date().toISOString(), status: 'returned' } };
        currentPass = null;
        break;
      case 'end':
        payload = { ok: true };
        break;
      default:
        payload = { session: fakeSession(currentProjection || {
          stepIndex: 0, releasedStepIndex: 0, steps: [], roomMode: 'live', clockVisible: true,
          timer: { active: false, kind: 'normal', endsAt: null, label: 'Timer' },
          pass: { active: false, publicLabel: 'AVAILABLE', startedAt: null },
          layout: { pass: 'bottom-left', clock: 'top-right', progress: 'top' },
        }) };
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
  });

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem('sb-jnbppgjkzzuquhenaqtq-auth-token', JSON.stringify({
      access_token: 'audit-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: expiresAt,
      refresh_token: 'audit-refresh',
      user: {
        id: 'audit-user',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'audit@example.com',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
      },
    }));
  });

  await page.getByRole('tab', { name: 'Day' }).click();
  const startButton = page.getByRole('button', { name: /Start class|Resume class/ }).first();
  await startButton.waitFor({ state: 'visible' });
  await startButton.click();
  await page.getByRole('dialog', { name: 'Arc Table teacher controller' }).waitFor({ state: 'visible' });
  await page.getByText('GOLD42').waitFor({ state: 'visible' });

  const layout = await page.evaluate(() => {
    const overlay = document.querySelector('[role="dialog"][aria-label="Arc Table teacher controller"]');
    const footer = overlay?.querySelector('footer');
    const topbar = overlay?.querySelector('header');
    const buttons = [...(overlay?.querySelectorAll('button') || [])].filter((el) => getComputedStyle(el).display !== 'none');
    return {
      sw: document.documentElement.scrollWidth,
      iw: innerWidth,
      sh: document.documentElement.scrollHeight,
      ih: innerHeight,
      overlay: overlay?.getBoundingClientRect().toJSON(),
      footer: footer?.getBoundingClientRect().toJSON(),
      topbar: topbar?.getBoundingClientRect().toJSON(),
      undersized: buttons
        .map((b) => ({ text: b.textContent?.trim(), r: b.getBoundingClientRect().toJSON() }))
        .filter(({ r }) => r && (r.height < 44 || r.width < 44)),
    };
  });

  if (layout.sw > layout.iw + 1) failures.push(`${width}x${height}: teacher document horizontal overflow ${layout.sw}/${layout.iw}`);
  if (!layout.overlay || Math.abs(layout.overlay.width - layout.iw) > 1 || Math.abs(layout.overlay.height - layout.ih) > 1) {
    failures.push(`${width}x${height}: teacher overlay does not fill viewport`);
  }
  if (!layout.footer || layout.footer.y + layout.footer.height > layout.ih + 1) failures.push(`${width}x${height}: teacher footer clipped`);
  if (layout.undersized.length) failures.push(`${width}x${height}: teacher controls below 44px target ${JSON.stringify(layout.undersized)}`);

  const liveFile = path.join(out, `teacher-live-${width}x${height}.png`);
  await page.screenshot({ path: liveFile, fullPage: false });
  evidence.push(path.basename(liveFile));

  for (const [button, expected] of [['Hold','held'],['Pause','paused'],['Blank','blank'],['Release','live']]) {
    await page.getByRole('button', { name: button, exact: true }).click();
    await page.getByText(new RegExp(`Student display:\\s*${expected}`, 'i')).waitFor({ state: 'visible' });
  }

  const timerInput = page.getByLabel('Timer minutes');
  await timerInput.fill('7');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: '5 min cleanup', exact: true }).click();

  await page.getByRole('button', { name: 'Choose student', exact: true }).click();
  await page.getByRole('button', { name: /Mia Rivera/ }).click();
  await page.getByRole('button', { name: /Mia is out/i }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: /Mia is out/i }).click();

  const note = page.getByLabel('Teacher note');
  await note.fill('private gold note');
  await page.getByRole('button', { name: 'End class', exact: true }).focus();
  const focusStyle = await page.getByRole('button', { name: 'End class', exact: true }).evaluate((el) => ({
    outlineStyle: getComputedStyle(el).outlineStyle,
    outlineWidth: getComputedStyle(el).outlineWidth,
  }));
  if (focusStyle.outlineStyle === 'none' || parseFloat(focusStyle.outlineWidth) < 2) failures.push(`${width}x${height}: visible keyboard focus missing`);

  await page.getByRole('button', { name: 'End class', exact: true }).click();
  await page.getByRole('alertdialog', { name: 'End class' }).waitFor({ state: 'visible' });
  const endFile = path.join(out, `teacher-end-${width}x${height}.png`);
  await page.screenshot({ path: endFile, fullPage: false });
  evidence.push(path.basename(endFile));
  await page.getByRole('button', { name: 'Keep teaching', exact: true }).click();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (!reduced) failures.push(`${width}x${height}: teacher reduced-motion emulation not active`);

  await page.close();
}

await browser.close();
failures.push(...privacyLeaks);

const report = {
  generatedAt: new Date().toISOString(),
  status: failures.length ? 'FAIL' : 'PASS',
  scope: 'teacher-facing Arc Table controller rendered from production build with teaching-session transport mocked only at network boundary',
  sizes: sizes.map(([w,h]) => `${w}x${h}`),
  actions: ['start','release','hold','pause','blank','timer','cleanup','roster','pass-start','pass-return','private-note','end-sheet','focus','reduced-motion'],
  evidence,
  failures,
  privacyLeaks,
  note: 'This is a deterministic render/interaction gate. It does not replace the separate live authenticated Supabase happy-path gate.',
};
fs.writeFileSync(path.join(out, 'teacher-render-audit.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
