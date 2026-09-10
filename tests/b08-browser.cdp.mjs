import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const chromeBin = process.env.CHROME_BIN;
if (!chromeBin) throw new Error('CHROME_BIN is required');

const baseUrl = 'http://127.0.0.1:43217';
const debugPort = 9333;
const artifactsDir = 'artifacts';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(url, timeout = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await sleep(150);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    ws.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result ?? {});
        return;
      }
      if (message.method) {
        for (const handler of this.events.get(message.method) ?? []) handler(message.params ?? {});
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  once(method, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Timed out waiting for CDP event ${method}`));
      }, timeout);
      const handler = (params) => {
        cleanup();
        resolve(params);
      };
      const cleanup = () => {
        clearTimeout(timer);
        const list = this.events.get(method) ?? [];
        this.events.set(method, list.filter((candidate) => candidate !== handler));
      };
      this.events.set(method, [...(this.events.get(method) ?? []), handler]);
    });
  }
}

const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: process.env,
});
preview.stdout.on('data', (data) => process.stdout.write(data));
preview.stderr.on('data', (data) => process.stderr.write(data));

const chrome = spawn(
  chromeBin,
  [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-allow-origins=*',
    `--remote-debugging-port=${debugPort}`,
    '--remote-debugging-address=127.0.0.1',
    '--user-data-dir=/tmp/arc-b08-chrome',
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] },
);
chrome.stderr.on('data', (data) => process.stderr.write(data));
chrome.on('exit', (code, signal) => {
  if (code && code !== 0) console.error(`Chromium exited early: code=${code} signal=${signal ?? 'none'}`);
});

async function openPage() {
  await waitFor(baseUrl);
  await waitFor(`http://127.0.0.1:${debugPort}/json/version`);
  const targetResponse = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' });
  if (!targetResponse.ok) throw new Error(`Could not create Chromium target: ${targetResponse.status}`);
  const target = await targetResponse.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  const cdp = new Cdp(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  await cdp.send('Network.setBlockedURLs', { urls: ['*cdn.jsdelivr.net/npm/@supabase/*'] });
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const harness = `
    (() => {
      const sessions = {
        'a@example.com': { access_token: 'token-a', refresh_token: 'refresh-a', user: { id: 'user-a', email: 'a@example.com' } },
        'b@example.com': { access_token: 'token-b', refresh_token: 'refresh-b', user: { id: 'user-b', email: 'b@example.com' } }
      };
      const state = window.__arcHarness = { session: null, rows: {}, listeners: [], lastSignOutScope: null, saves: [] };
      window.supabase = {
        createClient() {
          return {
            auth: {
              async getSession() { return { data: { session: state.session }, error: null }; },
              async signInWithPassword({ email, password }) {
                if (!sessions[email] || password !== 'arc-test-password') return { data: { session: null }, error: { message: 'Invalid login credentials' } };
                state.session = sessions[email];
                for (const listener of state.listeners) listener('SIGNED_IN', state.session);
                return { data: { session: state.session }, error: null };
              },
              async signOut(options) {
                state.lastSignOutScope = options?.scope ?? null;
                state.session = null;
                for (const listener of state.listeners) listener('SIGNED_OUT', null);
                return { error: null };
              },
              onAuthStateChange(callback) {
                state.listeners.push(callback);
                return { data: { subscription: { unsubscribe() { state.listeners = state.listeners.filter((item) => item !== callback); } } } };
              }
            },
            from(table) {
              if (table !== 'arc_workspaces') throw new Error('unexpected table');
              return {
                select() {
                  return {
                    eq(_column, userId) {
                      return {
                        async maybeSingle() {
                          const payload = state.rows[userId];
                          return { data: payload === undefined ? null : { payload, updated_at: new Date().toISOString() }, error: null };
                        }
                      };
                    }
                  };
                },
                async upsert(value) {
                  state.rows[value.user_id] = value.payload;
                  state.saves.push({ userId: value.user_id, payload: value.payload });
                  return { data: null, error: null };
                }
              };
            }
          };
        }
      };
    })();
  `;
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: harness });
  const loaded = cdp.once('Page.loadEventFired', 15000);
  await cdp.send('Page.navigate', { url: baseUrl });
  await loaded;
  return { cdp, ws };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser evaluation failed');
  return result.result?.value;
}

async function waitUntil(cdp, expression, label, timeout = 12000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(cdp, expression)) return;
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function fill(cdp, selector, value) {
  await evaluate(cdp, `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) throw new Error('Missing input: ' + ${JSON.stringify(selector)});
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
}

async function clickButton(cdp, text) {
  await evaluate(cdp, `(() => {
    const button = [...document.querySelectorAll('button')].find((item) => item.textContent.trim() === ${JSON.stringify(text)});
    if (!button) throw new Error('Missing button: ' + ${JSON.stringify(text)});
    button.click();
  })()`);
}

async function signIn(cdp, email) {
  await waitUntil(cdp, `!!document.querySelector('input[name="email"]')`, 'sign-in form');
  await fill(cdp, 'input[name="email"]', email);
  await fill(cdp, 'input[name="password"]', 'arc-test-password');
  await clickButton(cdp, 'Sign in');
  await waitUntil(cdp, `!document.querySelector('input[name="email"]')`, `workspace for ${email}`);
}

async function screenshot(cdp, name) {
  await mkdir(artifactsDir, { recursive: true });
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(`${artifactsDir}/${name}`, Buffer.from(result.data, 'base64'));
}

let page;
try {
  page = await openPage();
  const { cdp } = page;

  await waitUntil(cdp, `!!document.querySelector('input[name="email"]')`, 'initial auth form');
  const authSemantics = await evaluate(cdp, `(() => {
    const email = document.querySelector('input[name="email"]');
    const password = document.querySelector('input[name="password"]');
    const button = [...document.querySelectorAll('button')].find((item) => item.textContent.trim() === 'Sign in');
    return {
      emailAutocomplete: email?.autocomplete,
      passwordAutocomplete: password?.autocomplete,
      emailHeight: email?.getBoundingClientRect().height ?? 0,
      passwordHeight: password?.getBoundingClientRect().height ?? 0,
      buttonHeight: button?.getBoundingClientRect().height ?? 0,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  })()`);
  if (authSemantics.emailAutocomplete !== 'email') throw new Error('Email autocomplete contract failed');
  if (authSemantics.passwordAutocomplete !== 'current-password') throw new Error('Password autocomplete contract failed');
  if (Math.min(authSemantics.emailHeight, authSemantics.passwordHeight, authSemantics.buttonHeight) < 44) throw new Error('Auth touch target below 44px');
  if (authSemantics.overflow) throw new Error('Auth page overflows at 1280px');

  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await sleep(100);
  const narrowOverflow = await evaluate(cdp, `document.documentElement.scrollWidth > document.documentElement.clientWidth`);
  if (narrowOverflow) throw new Error('Auth page horizontally overflows at 390px');
  await screenshot(cdp, 'b08-auth-390.png');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });

  await signIn(cdp, 'a@example.com');
  await clickButton(cdp, 'Settings');
  await waitUntil(cdp, `!![...document.querySelectorAll('input')].find((el) => el.placeholder === 'New course name…')`, 'Settings course input');
  await evaluate(cdp, `(() => {
    const el = [...document.querySelectorAll('input')].find((item) => item.placeholder === 'New course name…');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, 'B08 ACCOUNT A ONLY');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await clickButton(cdp, 'Add course');
  await waitUntil(cdp, `document.body.innerText.includes('B08 ACCOUNT A ONLY')`, 'Account A unique course');
  await sleep(700);
  const aSave = await evaluate(cdp, `window.__arcHarness.saves.some((item) => item.userId === 'user-a' && JSON.stringify(item.payload).includes('B08 ACCOUNT A ONLY'))`);
  if (!aSave) throw new Error('Account A workspace did not reach remote persistence');

  await clickButton(cdp, 'Sign out');
  await waitUntil(cdp, `!!document.querySelector('input[name="email"]')`, 'sign-out return');
  const signOutScope = await evaluate(cdp, `window.__arcHarness.lastSignOutScope`);
  if (signOutScope !== 'local') throw new Error(`Expected local sign-out scope, got ${signOutScope}`);

  await signIn(cdp, 'b@example.com');
  const leakedToB = await evaluate(cdp, `document.body.innerText.includes('B08 ACCOUNT A ONLY')`);
  if (leakedToB) throw new Error('Account A state leaked into account B');

  await clickButton(cdp, 'Settings');
  await clickButton(cdp, 'Sign out');
  await waitUntil(cdp, `!!document.querySelector('input[name="email"]')`, 'B sign-out');
  await signIn(cdp, 'a@example.com');
  await waitUntil(cdp, `document.body.innerText.includes('B08 ACCOUNT A ONLY')`, 'Account A restoration');
  const exactOnce = await evaluate(cdp, `[...document.querySelectorAll('*')].filter((el) => el.children.length === 0 && el.textContent.trim() === 'B08 ACCOUNT A ONLY').length`);
  if (exactOnce !== 1) throw new Error(`Account A state restored ${exactOnce} times instead of exactly once`);
  await screenshot(cdp, 'b08-account-a-return-1280.png');

  const summary = await evaluate(cdp, `({
    savesA: window.__arcHarness.saves.filter((item) => item.userId === 'user-a').length,
    savesB: window.__arcHarness.saves.filter((item) => item.userId === 'user-b').length,
    signOutScope: window.__arcHarness.lastSignOutScope,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  })`);
  if (summary.overflow) throw new Error('Restored workspace horizontally overflows at 1280px');
  console.log('B08_BROWSER_GREEN', JSON.stringify(summary));
} finally {
  try { page?.ws?.close(); } catch {}
  preview.kill('SIGTERM');
  chrome.kill('SIGTERM');
}
