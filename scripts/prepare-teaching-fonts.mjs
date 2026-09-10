import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const fontDir = path.join(publicDir, 'fonts');
fs.mkdirSync(fontDir, { recursive: true });

const files = [
  ['@fontsource/inter/files/inter-latin-400-normal.woff2', 'inter-latin-400-normal.woff2'],
  ['@fontsource/inter/files/inter-latin-600-normal.woff2', 'inter-latin-600-normal.woff2'],
  ['@fontsource/inter/files/inter-latin-700-normal.woff2', 'inter-latin-700-normal.woff2'],
  ['@fontsource/inter/files/inter-latin-800-normal.woff2', 'inter-latin-800-normal.woff2'],
  ['@fontsource/league-spartan/files/league-spartan-latin-400-normal.woff2', 'league-spartan-latin-400-normal.woff2'],
  ['@fontsource/league-spartan/files/league-spartan-latin-700-normal.woff2', 'league-spartan-latin-700-normal.woff2'],
  ['@fontsource/league-spartan/files/league-spartan-latin-800-normal.woff2', 'league-spartan-latin-800-normal.woff2'],
  ['@fontsource/league-spartan/files/league-spartan-latin-900-normal.woff2', 'league-spartan-latin-900-normal.woff2'],
];

for (const [modulePath, filename] of files) {
  const src = path.join(root, 'node_modules', modulePath);
  if (!fs.existsSync(src)) throw new Error(`Missing required production font: ${modulePath}`);
  fs.copyFileSync(src, path.join(fontDir, filename));
}

const css = `@font-face{font-family:"Inter";font-style:normal;font-display:swap;font-weight:400;src:url('/fonts/inter-latin-400-normal.woff2') format('woff2')}\n@font-face{font-family:"Inter";font-style:normal;font-display:swap;font-weight:600;src:url('/fonts/inter-latin-600-normal.woff2') format('woff2')}\n@font-face{font-family:"Inter";font-style:normal;font-display:swap;font-weight:700;src:url('/fonts/inter-latin-700-normal.woff2') format('woff2')}\n@font-face{font-family:"Inter";font-style:normal;font-display:swap;font-weight:800;src:url('/fonts/inter-latin-800-normal.woff2') format('woff2')}\n@font-face{font-family:"League Spartan";font-style:normal;font-display:swap;font-weight:400;src:url('/fonts/league-spartan-latin-400-normal.woff2') format('woff2')}\n@font-face{font-family:"League Spartan";font-style:normal;font-display:swap;font-weight:700;src:url('/fonts/league-spartan-latin-700-normal.woff2') format('woff2')}\n@font-face{font-family:"League Spartan";font-style:normal;font-display:swap;font-weight:800;src:url('/fonts/league-spartan-latin-800-normal.woff2') format('woff2')}\n@font-face{font-family:"League Spartan";font-style:normal;font-display:swap;font-weight:900;src:url('/fonts/league-spartan-latin-900-normal.woff2') format('woff2')}\n`;
fs.writeFileSync(path.join(publicDir, 'teaching-fonts.css'), css);

function injectStylesheet(file) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, 'utf8');
  if (!html.includes('/teaching-fonts.css')) {
    html = html.replace('</head>', '<link rel="stylesheet" href="/teaching-fonts.css">\n</head>');
    fs.writeFileSync(full, html);
  }
}

injectStylesheet('index.html');
injectStylesheet('public/teaching-room.html');
console.log('Prepared self-hosted Inter and League Spartan for teacher and classroom surfaces.');
