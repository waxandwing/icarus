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

// The imported hostile circuit owns Chromium/Vite teardown. GitHub-hosted runners can
// keep inherited child-process handles alive after those processes receive SIGTERM,
// which previously caused a verified GREEN circuit to idle until the job timeout.
// Reaching this line means the full circuit completed without throwing, so terminate
// the harness process explicitly rather than letting stale handles invalidate evidence.
process.exit(0);
