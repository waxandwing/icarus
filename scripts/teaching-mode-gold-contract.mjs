import fs from 'node:fs';

const room = fs.readFileSync('public/teaching-room.html','utf8');
const teacher = fs.readFileSync('src/components/LiveClassroomOverlay.tsx','utf8');
const teacherCss = fs.readFileSync('src/components/LiveClassroomOverlay.module.css','utf8');
const controller = fs.readFileSync('src/teaching/teachingController.ts','utf8');
const transport = fs.readFileSync('src/teaching/liveSessionTransport.ts','utf8');

const checks = [
  ['student: pause/blank both route to blank state', /roomMode==='blank'\|\|projection\.roomMode==='paused'/.test(room)],
  ['student: blank state is black', /\.state\.blank\{background:#000/.test(room)],
  ['student: blank has no text content', /<div id="blank" class="state blank"[^>]*><\/div>/.test(room)],
  ['student: hold state is separate', /id="held" class="state held"/.test(room) && /roomMode==='held'/.test(room)],
  ['student: progress exists', /id="progress"/.test(room)],
  ['student: timer exists', /id="timer"/.test(room)],
  ['student: pass public label only', /publicLabel/.test(room) && !/passStudentName/.test(room)],
  ['student: reconnect state exists', /Reconnecting/.test(room)],
  ['student: reduced motion exists', /prefers-reduced-motion/.test(room)],
  ['teacher: explicit release control', /Release/i.test(teacher)],
  ['teacher: explicit hold control', /Hold/i.test(teacher)],
  ['teacher: explicit pause control', /Pause/i.test(teacher)],
  ['teacher: explicit blank control', /Blank/i.test(teacher)],
  ['teacher: timer control', /timer/i.test(teacher)],
  ['teacher: cleanup control', /cleanup/i.test(teacher)],
  ['teacher: roster/pass surface', /roster|student|pass/i.test(teacher)],
  ['teacher: private note surface', /quickNote|teacher note|private/i.test(teacher)],
  ['teacher: end session control', /End Class|End Session/i.test(teacher)],
  ['teacher: focus styling', /focus-visible/.test(teacherCss)],
  ['controller: teacher private state carries private fields', /quickNote/.test(controller) && /passStudentName/.test(controller)],
  ['transport: room projection excludes roster type', !/roster:/.test(transport.split('export type RoomProjection')[1].split('export type LiveSession')[0])],
  ['transport: polling remains 900ms', /TEACHING_ROOM_SYNC_MS\s*=\s*900/.test(transport)],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failed++;
}
console.log(`\n${checks.length-failed}/${checks.length} contract checks passed.`);
if (failed) process.exit(1);
