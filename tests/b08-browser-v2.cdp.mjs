import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const chromeBin = process.env.CHROME_BIN;
if (!chromeBin) throw new Error('CHROME_BIN is required');

const baseUrl = 'http://127.0.0.1:43217';
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

  once(method, timeout = 15000) {
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

let debugResolve;
let debugReject;
let debugSettled = false;
const debugPortPromise = new Promise((resolve, reject) => {
  debugResolve = resolve;
  debugReject = reject;
});

const chrome = spawn(
  chromeBin,
  [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=0',
    `--user-data-dir=/tmp/arc-b08-chrome-${process.pid}`,
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] },
);

let chromeDiagnostics = '';
chrome.stderr.on('data', (data) => {
  const text = String(data);
  chromeDiagnostics += text;
  const match = text.match(/DevTools listening on ws:\/\/[^:]+:(\d+)\//);
  if (match && !debugSettled) {
    debugSettled = true;
    debugResolve(Number(match[1]));
  }
});
chrome.on('exit', (code) => {
  if (!debugSettled) {
    debugSettled = true;
    debugReject(new Error(`Chromium exited before DevTools became ready (${code}). ${chromeDiagnostics.slice(-1500)}`));
  }
});

async function withTimeout(promise, ms, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timed out waiting for ${label}`)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function openPage() {
  await waitFor(baseUrl);
  const debugPort = await withTimeout(debugPortPromise, 20000, 'Chromium DevTools endpoint');
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
      const STORE_KEY = '__arcB08HarnessV2';
      const sessions = {
        'a@example.com': { access_token: 'token-a', refresh_token: 'refresh-a', user: { id: 'user-a', email: 'a@example.com' } },
        'b@example.com': { access_token: 'token-b', refresh_token: 'refresh-b', user: { id: 'user-b', email: 'b@example.com' } }
      };
      let saved = {};
      try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch {}
      const state = window.__arcHarness = {
        session: saved.session || null,
        rows: saved.rows || {},
        listeners: [],
        lastSignOutScope: saved.lastSignOutScope || null,
        saves: saved.saves || [],
        errors: saved.errors || []
      };
      const persist = () => localStorage.setItem(STORE_KEY, JSON.stringify({
        session: state.session,
        rows: state.rows,
        lastSignOutScope: state.lastSignOutScope,
        saves: state.saves,
        errors: state.errors
      }));
      window.addEventListener('error', (event) => {
        state.errors.push('error:' + (event.message || 'unknown'));
        persist();
      });
      window.addEventListener('unhandledrejection', (event) => {
        state.errors.push('rejection:' + String(event.reason?.message || event.reason || 'unknown'));
        persist();
      });
      window.supabase = {
        createClient() {
          return {
            auth: {
              async getSession() { return { data: { session: state.session }, error: null }; },
              async signInWithPassword({ email, password }) {
                if (!sessions[email] || password !== 'arc-test-password') {
                  return { data: { session: null }, error: { message: 'Invalid login credentials' } };
                }
                state.session = sessions[email];
                persist();
                for (const listener of state.listeners) listener('SIGNED_IN', state.session);
                return { data: { session: state.session }, error: null };
              },
              async signOut(options) {
                state.lastSignOutScope = options?.scope ?? null;
                state.session = null;
                persist();
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
                  persist();
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
  const loaded = cdp.once('Page.loadEventFired');
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
  if (result.exceptionDetails) {
    const detail = result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Browser evaluation failed';
    throw new Error(detail);
  }
  return result.result?.value;
}

async function waitUntil(cdp, expression, label, timeout = 12000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      if (await evaluate(cdp, expression)) return;
    } catch {}
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

async function addCourse(cdp, title) {
  await waitUntil(cdp, `!![...document.querySelectorAll('input')].find((el) => el.placeholder === 'New course name…')`, 'Settings course input');
  await evaluate(cdp, `(() => {
    const el = [...document.querySelectorAll('input')].find((item) => item.placeholder === 'New course name…');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, ${JSON.stringify(title)});
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await clickButton(cdp, 'Add course');
  await waitUntil(cdp, `document.body.innerText.includes(${JSON.stringify(title)})`, title);
}

async function reload(cdp) {
  const loaded = cdp.once('Page.loadEventFired');
  await cdp.send('Page.reload', { ignoreCache: true });
  await loaded;
}

async function screenshot(cdp, name) {
  await mkdir(artifactsDir, { recursive: true });
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(`${artifactsDir}/${name}`, Buffer.from(result.data, 'base64'));
}

async function assertViewAndFurniture(cdp, viewLabel, furnitureLabel) {
  const state = await evaluate(cdp, `(() => {
    const view = [...document.querySelectorAll('[role="tab"]')].find((item) => item.textContent.trim() === ${JSON.stringify(viewLabel)});
    const furniture = [...document.querySelectorAll('button')].find((item) => item.textContent.trim() === ${JSON.stringify(furnitureLabel)});
    return {
      selected: view?.getAttribute('aria-selected'),
      expanded: furniture?.getAttribute('aria-expanded'),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  })()`);
  if (state.selected !== 'true') throw new Error(`${viewLabel} did not restore as selected`);
  if (state.expanded !== 'true') throw new Error(`${furnitureLabel} did not restore as open furniture`);
  if (state.overflow) throw new Error('Workspace horizontally overflowed after restoration');
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

  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab' });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab' });
  const keyboardFocus = await evaluate(cdp, `document.activeElement?.getAttribute('name')`);
  if (keyboardFocus !== 'email') throw new Error(`Auth keyboard entry focus landed on ${keyboardFocus || 'nothing'} instead of email`);

  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await sleep(100);
  if (await evaluate(cdp, `document.documentElement.scrollWidth > document.documentElement.clientWidth`)) {
    throw new Error('Auth page horizontally overflows at 390px');
  }
  await screenshot(cdp, 'b08-auth-390.png');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });

  await signIn(cdp, 'a@example.com');
  await clickButton(cdp, 'Month');
  await clickButton(cdp, 'Settings');
  await addCourse(cdp, 'B08 ACCOUNT A ONLY');
  await sleep(700);
  const aSaved = await evaluate(cdp, `window.__arcHarness.saves.some((item) => item.userId === 'user-a' && JSON.stringify(item.payload).includes('B08 ACCOUNT A ONLY') && item.payload.workspace?.workspaceUi?.view === 'month')`);
  if (!aSaved) throw new Error('Account A did not persist its canonical domain and workspace context');

  await reload(cdp);
  await waitUntil(cdp, `document.body.innerText.includes('B08 ACCOUNT A ONLY')`, 'Account A hard-reload restoration');
  await assertViewAndFurniture(cdp, 'Month', 'Settings');
  await screenshot(cdp, 'b08-account-a-hard-reload.png');

  await clickButton(cdp, 'Sign out');
  await waitUntil(cdp, `!!document.querySelector('input[name="email"]')`, 'Account A sign-out');
  if ((await evaluate(cdp, `window.__arcHarness.lastSignOutScope`)) !== 'local') throw new Error('Sign-out did not use local scope');

  await signIn(cdp, 'b@example.com');
  if (await evaluate(cdp, `document.body.innerText.includes('B08 ACCOUNT A ONLY')`)) throw new Error('Account A state leaked into account B');
  await clickButton(cdp, 'Settings');
  await addCourse(cdp, 'B08 ACCOUNT B ONLY');
  await clickButton(cdp, 'Day');
  await clickButton(cdp, 'Fridge');
  await sleep(700);

  await reload(cdp);
  await waitUntil(cdp, `document.body.innerText.includes('B08 ACCOUNT B ONLY')`, 'Account B hard-reload restoration');
  if (await evaluate(cdp, `document.body.innerText.includes('B08 ACCOUNT A ONLY')`)) throw new Error('Account A state appeared after B hard reload');
  await assertViewAndFurniture(cdp, 'Day', 'Fridge');
  await screenshot(cdp, 'b08-account-b-hard-reload.png');

  await clickButton(cdp, 'Settings');
  await clickButton(cdp, 'Sign out');
  await waitUntil(cdp, `!!document.querySelector('input[name="email"]')`, 'Account B sign-out');
  await signIn(cdp, 'a@example.com');
  await waitUntil(cdp, `document.body.innerText.includes('B08 ACCOUNT A ONLY')`, 'Account A sign-back-in restoration');
  if (await evaluate(cdp, `document.body.innerText.includes('B08 ACCOUNT B ONLY')`)) throw new Error('Account B state leaked into restored account A');
  await assertViewAndFurniture(cdp, 'Month', 'Settings');

  const exactA = await evaluate(cdp, `[...document.querySelectorAll('*')].filter((el) => el.children.length === 0 && el.textContent.trim() === 'B08 ACCOUNT A ONLY').length`);
  if (exactA !== 1) throw new Error(`Account A unique state restored ${exactA} times instead of exactly once`);

  await clickButton(cdp, 'Sign out');
  await waitUntil(cdp, `!!document.querySelector('input[name="email"]')`, 'second A sign-out');
  await signIn(cdp, 'b@example.com');
  await waitUntil(cdp, `document.body.innerText.includes('B08 ACCOUNT B ONLY')`, 'Account B sign-back-in restoration');
  if (await evaluate(cdp, `document.body.innerText.includes('B08 ACCOUNT A ONLY')`)) throw new Error('Account A state leaked into restored account B');
  await assertViewAndFurniture(cdp, 'Day', 'Fridge');
  await screenshot(cdp, 'b08-account-b-final-return.png');

  const summary = await evaluate(cdp, `({
    savesA: window.__arcHarness.saves.filter((item) => item.userId === 'user-a').length,
    savesB: window.__arcHarness.saves.filter((item) => item.userId === 'user-b').length,
    errors: window.__arcHarness.errors,
    signOutScope: window.__arcHarness.lastSignOutScope,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  })`);
  if (summary.errors.length) throw new Error(`Browser errors were recorded: ${summary.errors.join(' | ')}`);
  if (summary.overflow) throw new Error('Restored workspace horizontally overflows at 1280px');
  console.log('B08_BROWSER_V2_GREEN', JSON.stringify(summary));
} finally {
  try { page?.ws?.close(); } catch {}
  preview.kill('SIGTERM');
  chrome.kill('SIGTERM');
}
