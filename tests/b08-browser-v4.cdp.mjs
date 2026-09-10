import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const chromeBin = process.env.CHROME_BIN;
if (!chromeBin) throw new Error('CHROME_BIN is required');
const baseUrl = 'http://127.0.0.1:43217';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForUrl(url, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await sleep(125);
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
      const msg = JSON.parse(String(event.data));
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result ?? {});
        return;
      }
      if (msg.method) {
        for (const fn of this.events.get(msg.method) ?? []) fn(msg.params ?? {});
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
      const fn = (params) => {
        cleanup();
        resolve(params);
      };
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeout);
      const cleanup = () => {
        clearTimeout(timer);
        this.events.set(method, (this.events.get(method) ?? []).filter((candidate) => candidate !== fn));
      };
      this.events.set(method, [...(this.events.get(method) ?? []), fn]);
    });
  }
}

const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: process.env,
});
preview.stdout.on('data', (data) => process.stdout.write(data));
preview.stderr.on('data', (data) => process.stderr.write(data));

let resolvePort;
let rejectPort;
let portSettled = false;
const portPromise = new Promise((resolve, reject) => {
  resolvePort = resolve;
  rejectPort = reject;
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
    `--user-data-dir=/tmp/arc-b08-v4-${process.pid}`,
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] },
);
let chromeTail = '';
chrome.stderr.on('data', (data) => {
  const text = String(data);
  chromeTail = (chromeTail + text).slice(-3000);
  const match = text.match(/DevTools listening on ws:\/\/[^:]+:(\d+)\//);
  if (match && !portSettled) {
    portSettled = true;
    resolvePort(Number(match[1]));
  }
});
chrome.on('exit', (code) => {
  if (!portSettled) {
    portSettled = true;
    rejectPort(new Error(`Chrome exited ${code}: ${chromeTail}`));
  }
});

async function evalJs(cdp, expression) {
  const out = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (out.exceptionDetails) {
    throw new Error(out.exceptionDetails.exception?.description || out.exceptionDetails.text || 'browser evaluation failed');
  }
  return out.result?.value;
}

async function waitJs(cdp, expression, label, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      if (await evalJs(cdp, expression)) return;
    } catch {}
    await sleep(100);
  }
  const diagnostic = await evalJs(cdp, `({body:document.body.innerText.slice(0,2500),inputs:[...document.querySelectorAll('input')].map(x=>({name:x.name,placeholder:x.placeholder})),buttons:[...document.querySelectorAll('button')].map(x=>({id:x.id,text:x.textContent.trim(),expanded:x.getAttribute('aria-expanded')}))})`);
  throw new Error(`Timed out waiting for ${label}: ${JSON.stringify(diagnostic)}`);
}

async function clickSelector(cdp, selector, label = selector) {
  await evalJs(cdp, `(() => { const el=document.querySelector(${JSON.stringify(selector)}); if(!el) throw new Error('Missing ${label}'); el.click(); })()`);
}

async function clickText(cdp, text) {
  await evalJs(cdp, `(() => { const el=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===${JSON.stringify(text)}); if(!el) throw new Error('Missing button: '+${JSON.stringify(text)}); el.click(); })()`);
}

async function fillNamed(cdp, name, value) {
  await evalJs(cdp, `(() => { const el=document.querySelector('input[name="${name}"]'); if(!el) throw new Error('Missing ${name} input'); const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; setter.call(el,${JSON.stringify(value)}); el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); })()`);
}

async function signIn(cdp, email) {
  await waitJs(cdp, `!!document.querySelector('input[name="email"]')`, 'sign-in form');
  await fillNamed(cdp, 'email', email);
  await fillNamed(cdp, 'password', 'arc-test-password');
  await clickText(cdp, 'Sign in');
  await waitJs(cdp, `!!document.querySelector('#arc-settings-tab') && [...document.querySelectorAll('[role="tab"]')].some(x=>x.textContent.trim()==='Month')`, `calendar ready for ${email}`);
}

async function openSettings(cdp) {
  await clickSelector(cdp, '#arc-settings-tab', 'Settings tab');
  await waitJs(cdp, `document.querySelector('#arc-settings-tab')?.getAttribute('aria-expanded')==='true'`, 'Settings open');
}

async function addCourse(cdp, title) {
  const selector = '#arc-settings-panel input[placeholder^="New course name"]';
  await waitJs(cdp, `!!document.querySelector(${JSON.stringify(selector)})`, 'course input');
  await evalJs(cdp, `(() => { const el=document.querySelector(${JSON.stringify(selector)}); const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; setter.call(el,${JSON.stringify(title)}); el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  await evalJs(cdp, `document.querySelector('#arc-settings-panel button[type="submit"]:last-of-type')?.click()`);
  await waitJs(cdp, `document.body.innerText.includes(${JSON.stringify(title)})`, title);
}

async function reload(cdp) {
  const done = cdp.once('Page.loadEventFired');
  await cdp.send('Page.reload', { ignoreCache: true });
  await done;
}

async function shot(cdp, name) {
  await mkdir('artifacts', { recursive: true });
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(`artifacts/${name}`, Buffer.from(result.data, 'base64'));
}

async function assertContext(cdp, view, furnitureSelector) {
  const result = await evalJs(cdp, `(() => { const view=[...document.querySelectorAll('[role="tab"]')].find(x=>x.textContent.trim()===${JSON.stringify(view)}); const furniture=document.querySelector(${JSON.stringify(furnitureSelector)}); return {selected:view?.getAttribute('aria-selected'),expanded:furniture?.getAttribute('aria-expanded'),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}; })()`);
  if (result.selected !== 'true') throw new Error(`${view} view was not restored`);
  if (result.expanded !== 'true') throw new Error(`${furnitureSelector} was not restored open`);
  if (result.overflow) throw new Error('workspace horizontal overflow');
}

let page;
try {
  await waitForUrl(baseUrl);
  const debugPort = await Promise.race([
    portPromise,
    sleep(20000).then(() => { throw new Error('DevTools startup timeout'); }),
  ]);
  await waitForUrl(`http://127.0.0.1:${debugPort}/json/version`);
  const targetResponse = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' });
  if (!targetResponse.ok) throw new Error(`Could not create Chromium target: ${targetResponse.status}`);
  const target = await targetResponse.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  const cdp = new Cdp(ws);
  page = { cdp, ws };
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  await cdp.send('Network.setBlockedURLs', { urls: ['*cdn.jsdelivr.net/npm/@supabase/*'] });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });

  const harness = `(() => {
    const K='__arcB08v4';
    const sessions={'a@example.com':{access_token:'ta',refresh_token:'ra',user:{id:'user-a',email:'a@example.com'}},'b@example.com':{access_token:'tb',refresh_token:'rb',user:{id:'user-b',email:'b@example.com'}}};
    let saved={}; try{saved=JSON.parse(localStorage.getItem(K)||'{}')}catch{}
    const state=window.__arcHarness={session:saved.session||null,rows:saved.rows||{},saves:saved.saves||[],lastSignOutScope:saved.lastSignOutScope||null,errors:saved.errors||[],listeners:[]};
    const persist=()=>localStorage.setItem(K,JSON.stringify({session:state.session,rows:state.rows,saves:state.saves,lastSignOutScope:state.lastSignOutScope,errors:state.errors}));
    addEventListener('error',e=>{state.errors.push('error:'+(e.message||'unknown'));persist()});
    addEventListener('unhandledrejection',e=>{state.errors.push('rejection:'+String(e.reason?.message||e.reason||'unknown'));persist()});
    window.supabase={createClient(){return {auth:{
      async getSession(){return {data:{session:state.session},error:null}},
      async signInWithPassword({email,password}){if(!sessions[email]||password!=='arc-test-password')return {data:{session:null},error:{message:'Invalid login credentials'}};state.session=sessions[email];persist();for(const f of state.listeners)f('SIGNED_IN',state.session);return {data:{session:state.session},error:null}},
      async signOut(options){state.lastSignOutScope=options?.scope??null;state.session=null;persist();for(const f of state.listeners)f('SIGNED_OUT',null);return {error:null}},
      onAuthStateChange(f){state.listeners.push(f);return {data:{subscription:{unsubscribe(){state.listeners=state.listeners.filter(x=>x!==f)}}}}}
    },from(table){if(table!=='arc_workspaces')throw new Error('unexpected table');return {
      select(){return {eq(_column,userId){return {async maybeSingle(){const payload=state.rows[userId];return {data:payload===undefined?null:{payload,updated_at:new Date().toISOString()},error:null}}}}}},
      async upsert(value){state.rows[value.user_id]=value.payload;state.saves.push({userId:value.user_id,payload:value.payload});persist();return {data:null,error:null}}
    }}}}};
  })();`;
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: harness });
  const firstLoad = cdp.once('Page.loadEventFired');
  await cdp.send('Page.navigate', { url: baseUrl });
  await firstLoad;

  await waitJs(cdp, `!!document.querySelector('input[name="email"]')`, 'auth form');
  const auth = await evalJs(cdp, `(() => {const e=document.querySelector('input[name="email"]'),p=document.querySelector('input[name="password"]'),b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Sign in');return {emailAutocomplete:e?.autocomplete,passwordAutocomplete:p?.autocomplete,minHeight:Math.min(e?.getBoundingClientRect().height||0,p?.getBoundingClientRect().height||0,b?.getBoundingClientRect().height||0),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}})()`);
  if (auth.emailAutocomplete !== 'email' || auth.passwordAutocomplete !== 'current-password' || auth.minHeight < 44 || auth.overflow) throw new Error(`auth gate failed: ${JSON.stringify(auth)}`);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab' });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab' });
  if ((await evalJs(cdp, `document.activeElement?.getAttribute('name')`)) !== 'email') throw new Error('auth keyboard focus did not enter email');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await sleep(100);
  if (await evalJs(cdp, `document.documentElement.scrollWidth>document.documentElement.clientWidth`)) throw new Error('auth overflow at 390px');
  await shot(cdp, 'b08-auth-390.png');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });

  await signIn(cdp, 'a@example.com');
  await clickText(cdp, 'Month');
  await openSettings(cdp);
  await shot(cdp, 'b08-a-settings-open.png');
  await addCourse(cdp, 'B08 ACCOUNT A ONLY');
  await sleep(700);
  if (!(await evalJs(cdp, `window.__arcHarness.saves.some(x=>x.userId==='user-a'&&JSON.stringify(x.payload).includes('B08 ACCOUNT A ONLY')&&x.payload.workspace?.workspaceUi?.view==='month'&&x.payload.workspace?.workspaceUi?.openPanel==='settings')`))) throw new Error('A did not reach remote persistence with month/settings context');
  await reload(cdp);
  await waitJs(cdp, `document.body.innerText.includes('B08 ACCOUNT A ONLY')`, 'A hard reload');
  await assertContext(cdp, 'Month', '#arc-settings-tab');
  await shot(cdp, 'b08-a-reload.png');
  await clickText(cdp, 'Sign out');
  await waitJs(cdp, `!!document.querySelector('input[name="email"]')`, 'A signout');
  if ((await evalJs(cdp, `window.__arcHarness.lastSignOutScope`)) !== 'local') throw new Error('signout scope not local');

  await signIn(cdp, 'b@example.com');
  if (await evalJs(cdp, `document.body.innerText.includes('B08 ACCOUNT A ONLY')`)) throw new Error('A leaked to B');
  await openSettings(cdp);
  await addCourse(cdp, 'B08 ACCOUNT B ONLY');
  await clickText(cdp, 'Day');
  await clickSelector(cdp, '#arc-fridge-tab', 'Fridge tab');
  await waitJs(cdp, `document.querySelector('#arc-fridge-tab')?.getAttribute('aria-expanded')==='true'`, 'Fridge open');
  await sleep(700);
  await reload(cdp);
  await waitJs(cdp, `document.body.innerText.includes('B08 ACCOUNT B ONLY')`, 'B hard reload');
  if (await evalJs(cdp, `document.body.innerText.includes('B08 ACCOUNT A ONLY')`)) throw new Error('A leaked after B reload');
  await assertContext(cdp, 'Day', '#arc-fridge-tab');
  await shot(cdp, 'b08-b-reload.png');

  await openSettings(cdp);
  await clickText(cdp, 'Sign out');
  await waitJs(cdp, `!!document.querySelector('input[name="email"]')`, 'B signout');
  await signIn(cdp, 'a@example.com');
  await waitJs(cdp, `document.body.innerText.includes('B08 ACCOUNT A ONLY')`, 'A sign-back-in return');
  if (await evalJs(cdp, `document.body.innerText.includes('B08 ACCOUNT B ONLY')`)) throw new Error('B leaked into restored A');
  await assertContext(cdp, 'Month', '#arc-settings-tab');
  await clickText(cdp, 'Sign out');
  await waitJs(cdp, `!!document.querySelector('input[name="email"]')`, 'A second signout');

  await signIn(cdp, 'b@example.com');
  await waitJs(cdp, `document.body.innerText.includes('B08 ACCOUNT B ONLY')`, 'B sign-back-in return');
  if (await evalJs(cdp, `document.body.innerText.includes('B08 ACCOUNT A ONLY')`)) throw new Error('A leaked into restored B');
  await assertContext(cdp, 'Day', '#arc-fridge-tab');
  await shot(cdp, 'b08-b-final.png');

  const summary = await evalJs(cdp, `({savesA:window.__arcHarness.saves.filter(x=>x.userId==='user-a').length,savesB:window.__arcHarness.saves.filter(x=>x.userId==='user-b').length,errors:window.__arcHarness.errors,scope:window.__arcHarness.lastSignOutScope,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth})`);
  if (summary.errors.length) throw new Error(`browser errors: ${summary.errors.join(' | ')}`);
  if (summary.overflow) throw new Error('final workspace overflow');
  console.log('B08_BROWSER_V4_GREEN', JSON.stringify(summary));
} finally {
  try { page?.ws?.close(); } catch {}
  preview.kill('SIGTERM');
  chrome.kill('SIGTERM');
}
