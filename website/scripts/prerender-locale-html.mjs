#!/usr/bin/env node --experimental-strip-types
/**
 * After `vite build`, write static HTML shells per locale and route so view-source
 * and no-JS crawlers see localized <title> and meta tags on GitHub Pages.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const LOCALES_ROOT = join(ROOT, 'src', 'locales');

const SITE_ORIGIN = 'https://yanovian.github.io';
const SITE_REPO_PATH = 'chrome-ext-why-am-i-here';
const SITE_URL = `${SITE_ORIGIN}/${SITE_REPO_PATH}/`;
const SITE_NAME = 'Why Am I Here?';

function siteOgImageUrl(locale) {
  const path = locale && locale !== 'en' ? `og/${locale}.png` : 'og-image.png';
  return new URL(path, SITE_URL).href;
}

const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;
import { PRERENDER_PAGES } from '../site-pages.ts';
const RTL_LOCALES = new Set(['ar', 'fa']);

const basePath = process.env.VITE_BASE_PATH ?? '/';
const assetBase = basePath.endsWith('/') ? basePath : `${basePath}/`;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;');
}

function hreflangTag(locale) {
  return locale.replace('_', '-');
}

function ogLocaleTag(locale) {
  if (locale === 'en') {
    return 'en_US';
  }
  const [lang, region] = locale.split('_');
  return region ? `${lang}_${region.toUpperCase()}` : `${lang}_${lang.toUpperCase()}`;
}

function sitePageUrl(page, locale) {
  const localePrefix = locale && locale !== 'en' ? `${locale}/` : '';
  if (!page) {
    return new URL(localePrefix, SITE_URL).href;
  }
  return new URL(`${localePrefix}${page}`, SITE_URL).href;
}

function readLocales() {
  return readdirSync(LOCALES_ROOT).filter((entry) =>
    existsSync(join(LOCALES_ROOT, entry, 'seo.json')),
  );
}

function loadSeo(locale) {
  return JSON.parse(readFileSync(join(LOCALES_ROOT, locale, 'seo.json'), 'utf8'));
}

function extractBuiltAssets(indexHtml) {
  const scripts = [...indexHtml.matchAll(/<script[^>]+src="([^"]+)"[^>]*><\/script>/g)].map(
    (match) => match[1],
  );
  const styles = [...indexHtml.matchAll(/<link rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/g)].map(
    (match) => match[1],
  );
  return { scripts, styles };
}

function resolveAssetHref(href) {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }
  if (href.startsWith('/')) {
    return href;
  }
  if (href.startsWith('./')) {
    return `${assetBase}${href.slice(2)}`;
  }
  return `${assetBase}${href}`;
}

function singleLineMeta(text) {
  return String(text).replace(/\s+/g, ' ').trim();
}

function pageMeta(seo, page) {
  if (!page) {
    return {
      title: singleLineMeta(seo.title),
      description: singleLineMeta(seo.description),
      ogType: 'website',
    };
  }

  const meta = seo[page];
  if (!meta?.title || !meta?.description) {
    throw new Error(`Missing seo.${page}.title or seo.${page}.description`);
  }

  return {
    title: meta.title,
    description: meta.description,
    ogType: 'article',
  };
}

function buildHtml({ locale, page, seo, scripts, styles, locales }) {
  const { title, description, ogType } = pageMeta(seo, page);
  const htmlLang = hreflangTag(locale);
  const dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
  const canonical = sitePageUrl(page, locale === 'en' ? undefined : locale);
  const authorName = seo.authorName || 'Yanovian LLC';
  const ogImageAlt = seo.ogImageAlt || SITE_NAME;
  const ogLocale = ogLocaleTag(locale);
  const ogImage = siteOgImageUrl(locale);

  const hreflangLinks = locales
    .map((code) => {
      const href = sitePageUrl(page, code === 'en' ? undefined : code);
      return `<link rel="alternate" hreflang="${escapeHtml(hreflangTag(code))}" href="${escapeHtml(href)}" />`;
    })
    .join('\n    ');

  const alternateOgLocales = locales
    .filter((code) => code !== locale)
    .map(
      (code) =>
        `<meta property="og:locale:alternate" content="${escapeHtml(ogLocaleTag(code))}" />`,
    )
    .join('\n    ');

  const styleTags = styles
    .map((href) => `<link rel="stylesheet" crossorigin href="${escapeHtml(resolveAssetHref(href))}" />`)
    .join('\n    ');
  const scriptTags = scripts
    .map(
      (src) =>
        `<script type="module" crossorigin src="${escapeHtml(resolveAssetHref(src))}"></script>`,
    )
    .join('\n    ');

  return `<!doctype html>
<html lang="${escapeHtml(htmlLang)}" dir="${dir}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0b1220" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="author" content="${escapeHtml(authorName)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <link rel="icon" type="image/png" href="${escapeHtml(`${assetBase}icon.png`)}" />
    <link rel="apple-touch-icon" href="${escapeHtml(`${assetBase}icon.png`)}" />
    ${hreflangLinks}
    <link rel="alternate" hreflang="x-default" href="${escapeHtml(sitePageUrl(page))}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta property="og:locale" content="${escapeHtml(ogLocale)}" />
    ${alternateOgLocales}
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta property="og:image:width" content="${String(OG_IMAGE_WIDTH)}" />
    <meta property="og:image:height" content="${String(OG_IMAGE_HEIGHT)}" />
    <meta property="og:image:alt" content="${escapeHtml(ogImageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(ogImageAlt)}" />
    ${styleTags}
    ${scriptTags}
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;
}

function outputPath(locale, page) {
  if (locale === 'en') {
    if (!page) {
      return join(DIST, 'index.html');
    }
    return join(DIST, page, 'index.html');
  }
  if (!page) {
    return join(DIST, locale, 'index.html');
  }
  return join(DIST, locale, page, 'index.html');
}

function main() {
  const indexPath = join(DIST, 'index.html');
  if (!existsSync(indexPath)) {
    throw new Error('dist/index.html not found. Run vite build first.');
  }

  const builtIndex = readFileSync(indexPath, 'utf8');
  const { scripts, styles } = extractBuiltAssets(builtIndex);
  const locales = readLocales();
  let written = 0;

  for (const locale of locales) {
    const seo = loadSeo(locale);
    for (const page of PRERENDER_PAGES) {
      const html = buildHtml({ locale, page, seo, scripts, styles, locales });
      const out = outputPath(locale, page);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, html);
      written += 1;
    }
  }

  cpSync(join(DIST, 'index.html'), join(DIST, '404.html'));
  console.log(`[prerender-locale-html] wrote ${written} localized HTML shells`);
}

main();
