import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile(new URL('./b08-browser-v4.cdp.mjs', import.meta.url), 'utf8');
const before = "await evalJs(cdp, `document.querySelector('#arc-settings-panel button[type=\"submit\"]:last-of-type')?.click()`);";
const after = "await clickText(cdp, 'Add course');";

if (!source.includes(before)) {
  throw new Error('B08 v5 could not find the v4 Add course action to harden.');
}

const runtimePath = '/tmp/b08-browser-v5-runtime.mjs';
await writeFile(runtimePath, source.replace(before, after), 'utf8');
await import(`file://${runtimePath}?run=${Date.now()}`);
