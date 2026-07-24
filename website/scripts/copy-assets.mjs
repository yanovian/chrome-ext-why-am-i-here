import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(websiteRoot, '..');
const repoPublic = join(repoRoot, 'public');
const outPublic = join(websiteRoot, 'public');

const iconAssets = [
  ['icon/128.png', 'icon.png'],
  ['icon/48.png', 'icon-48.png'],
];

const staticRoot = join(websiteRoot, 'static');
const staticAssets = [
  ['robots.txt', 'robots.txt'],
  ['sitemap.xml', 'sitemap.xml'],
  ['og-image.png', 'og-image.png'],
  ['googlef48c50e4269d9151.html', 'googlef48c50e4269d9151.html'],
];

mkdirSync(join(outPublic, 'og'), { recursive: true });

for (const [from, to] of iconAssets) {
  cpSync(join(repoPublic, from), join(outPublic, to));
}

for (const [from, to] of staticAssets) {
  if (existsSync(join(staticRoot, from))) {
    cpSync(join(staticRoot, from), join(outPublic, to));
  }
}

const ogStaticDir = join(staticRoot, 'og');
if (existsSync(ogStaticDir)) {
  for (const file of readdirSync(ogStaticDir)) {
    if (file.endsWith('.png')) {
      cpSync(join(ogStaticDir, file), join(outPublic, 'og', file));
    }
  }
}

console.log(`Copied ${iconAssets.length} icon assets and static files to website/public/`);
