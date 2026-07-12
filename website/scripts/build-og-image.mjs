import { mkdirSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;
const RTL_LOCALES = new Set(['ar', 'fa']);
const WIDE_TEXT_LOCALES = new Set(['hy']);

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesRoot = join(websiteRoot, 'src', 'locales');
const staticRoot = join(websiteRoot, 'static');
const ogDir = join(staticRoot, 'og');
const defaultOutPath = join(staticRoot, 'og-image.png');
const publicRoot = join(websiteRoot, 'public');
const iconPath = join(publicRoot, 'icon.png');
const fontsDir = join(staticRoot, 'fonts');

const ICON_LEFT = 100;
const TEXT_FONT =
  "'Segoe UI', 'Noto Sans Arabic', 'Noto Sans Armenian', system-ui, sans-serif";
const ARMENIAN_FONT_FAMILY = "'Waih Noto Armenian', 'Noto Sans Armenian', sans-serif";

function readFont(name) {
  const path = join(fontsDir, name);
  if (!existsSync(path)) {
    return '';
  }
  return readFileSync(path).toString('base64');
}

const armenianFontRegular = readFont('NotoSansArmenian-Regular.woff2');
const armenianFontBold = readFont('NotoSansArmenian-Bold.woff2');

function fontFamilyFor(locale) {
  return WIDE_TEXT_LOCALES.has(locale) ? ARMENIAN_FONT_FAMILY : TEXT_FONT;
}

function svgFontDefs(locale) {
  if (!WIDE_TEXT_LOCALES.has(locale) || !armenianFontRegular) {
    return '';
  }
  return `<style>
    @font-face {
      font-family: 'Waih Noto Armenian';
      font-weight: 400 500;
      src: url('data:font/woff2;base64,${armenianFontRegular}') format('woff2');
    }
    @font-face {
      font-family: 'Waih Noto Armenian';
      font-weight: 700 800;
      src: url('data:font/woff2;base64,${armenianFontBold}') format('woff2');
    }
  </style>`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function truncate(value, max) {
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function wrapLines(text, maxChars, maxLines) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current) {
      lines.push(current);
    }
    current = word;
    if (lines.length >= maxLines) {
      break;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = truncate(lines[maxLines - 1], maxChars);
  }
  return lines;
}

function loadLocales() {
  return readdirSync(localesRoot).filter((entry) =>
    existsSync(join(localesRoot, entry, 'seo.json')),
  );
}

function layout(locale) {
  if (RTL_LOCALES.has(locale)) {
    return { textX: 1175, anchor: 'start', direction: 'rtl', headlineMaxChars: 36, bodyMaxChars: 44, headlineLines: 2, bodyLines: 3 };
  }
  if (WIDE_TEXT_LOCALES.has(locale)) {
    return { textX: 470, anchor: 'start', direction: 'ltr', headlineMaxChars: 24, bodyMaxChars: 34, headlineLines: 2, bodyLines: 3 };
  }
  return { textX: 470, anchor: 'start', direction: 'ltr', headlineMaxChars: 28, bodyMaxChars: 38, headlineLines: 2, bodyLines: 3 };
}

function linesFromText(text, maxChars, maxLines) {
  if (text.includes('\n')) {
    return text.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, maxLines);
  }
  return wrapLines(text, maxChars, maxLines);
}

function textBlock({ x, anchor, direction, y, size, weight, fill, lines, lineHeight, fontFamily }) {
  const spans = lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : lineHeight;
      return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join('');
  return `<text x="${x}" y="${y}" fill="${fill}" direction="${direction}" text-anchor="${anchor}" font-family="${fontFamily}" font-size="${size}" font-weight="${weight}">${spans}</text>`;
}

function buildSvg({ headlineLines, bodyLines, layoutConfig, locale }) {
  const { textX, anchor, direction } = layoutConfig;
  const fontFamily = fontFamilyFor(locale);
  const titleSize = direction === 'rtl' ? 48 : 52;
  const titleY = 220;
  const bodyY = titleY + headlineLines.length * 62 + 32;
  const bodySize = 28;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OG_IMAGE_WIDTH}" height="${OG_IMAGE_HEIGHT}" viewBox="0 0 ${OG_IMAGE_WIDTH} ${OG_IMAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${svgFontDefs(locale)}
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f766e"/>
      <stop offset="45%" stop-color="#0b1220"/>
      <stop offset="100%" stop-color="#041f1e"/>
    </linearGradient>
    <radialGradient id="glow" cx="28%" cy="38%" r="55%">
      <stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#2dd4bf" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${OG_IMAGE_WIDTH}" height="${OG_IMAGE_HEIGHT}" fill="url(#bg)"/>
  <rect width="${OG_IMAGE_WIDTH}" height="${OG_IMAGE_HEIGHT}" fill="url(#glow)"/>
  <rect x="80" y="130" width="340" height="370" rx="28" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.08"/>
  ${textBlock({ x: textX, anchor, direction, y: titleY, size: titleSize, weight: 800, fill: '#f1f5f9', lines: headlineLines, lineHeight: 62, fontFamily })}
  ${textBlock({ x: textX, anchor, direction, y: bodyY, size: bodySize, weight: 500, fill: '#94a3b8', lines: bodyLines, lineHeight: 52, fontFamily })}
</svg>`;
}

async function loadIconImage() {
  if (!existsSync(iconPath)) {
    throw new Error('icon.png not found. Run copy-assets first.');
  }
  return sharp(iconPath).resize(280, 280, { fit: 'contain' }).png().toBuffer();
}

async function renderOgImage({ locale, seo, iconImage }) {
  const layoutConfig = layout(locale);
  const headline = truncate(seo.title.replace(/^Why Am I Here\??[.:]\s*/i, ''), 64);
  const headlineLines = linesFromText(headline, layoutConfig.headlineMaxChars, layoutConfig.headlineLines);
  const bodyLines = linesFromText(seo.description, layoutConfig.bodyMaxChars, layoutConfig.bodyLines);
  const svg = buildSvg({ headlineLines, bodyLines, layoutConfig, locale });
  const textLayer = await sharp(Buffer.from(svg)).png().toBuffer();

  return sharp({
    create: {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      channels: 4,
      background: '#0b1220',
    },
  })
    .composite([
      { input: textLayer, top: 0, left: 0 },
      { input: iconImage, top: 175, left: ICON_LEFT },
    ])
    .png()
    .toBuffer();
}

async function main() {
  mkdirSync(ogDir, { recursive: true });
  const iconImage = await loadIconImage();
  const locales = loadLocales();
  let wrote = 0;

  for (const locale of locales) {
    const seo = JSON.parse(readFileSync(join(localesRoot, locale, 'seo.json'), 'utf8'));
    const png = await renderOgImage({ locale, seo, iconImage });
    const outPath = join(ogDir, `${locale}.png`);
    await sharp(png).toFile(outPath);
    if (locale === 'en') {
      await sharp(png).toFile(defaultOutPath);
    }
    wrote += 1;
  }

  console.log(`[build-og-image] wrote ${wrote} OG images (${OG_IMAGE_WIDTH}x${OG_IMAGE_HEIGHT})`);
}

await main();
