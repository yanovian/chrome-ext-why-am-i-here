/** Public site URL without trailing slash (GitHub Pages). */
export const SITE_ORIGIN = 'https://yanovian.github.io';

/** Repo path segment on GitHub Pages. */
export const SITE_REPO_PATH = 'chrome-ext-why-am-i-here';

export const SITE_URL = `${SITE_ORIGIN}/${SITE_REPO_PATH}/`;

export const SITE_NAME = 'Why Am I Here?';

export const CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/why-am-i-here/oljicgnpidagkgpnpcdihcbdkimibefl';

export const GITHUB_URL = 'https://github.com/yanovian/chrome-ext-why-am-i-here';

export const YANOVIAN_LLC_NAME = 'Yanovian LLC';

export const YANOVIAN_LLC_URL = 'https://yanovian.com';

export const POUYAN_RAZIAN_NAME = 'Pooyan Razian';

export const POUYAN_RAZIAN_URL = 'https://pooyan.info';

export const OG_IMAGE_WIDTH = 1200;

export const OG_IMAGE_HEIGHT = 630;

/** Relative path to the locale OG share image in `public/`. */
export function ogImagePath(locale?: string): string {
  if (!locale || locale === 'en') {
    return 'og-image.png';
  }
  return `og/${locale}.png`;
}

export const OG_IMAGE_PATH = ogImagePath('en');

export function absoluteAssetUrl(assetPath: string): string {
  const path = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  return new URL(path, SITE_URL).href;
}

/** Canonical URL for a site route (e.g. `privacy` → `…/chrome-ext-why-am-i-here/privacy`). */
export function sitePageUrl(path: string, locale?: string): string {
  const segment = path.replace(/^\/+/, '').replace(/\/+$/, '');
  const localePrefix = locale && locale !== 'en' ? `${locale}/` : '';
  if (!segment) {
    return new URL(localePrefix, SITE_URL).href;
  }
  return new URL(`${localePrefix}${segment}`, SITE_URL).href;
}
