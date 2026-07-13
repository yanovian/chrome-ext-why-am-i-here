import {
  WEBSITE_LOCALES,
  type WebsiteLocale,
  isWebsiteLocale,
} from '@/i18n/locales';
import { isSitePage, type SitePage } from '../../site-pages';

export type { SitePage, SubPageId } from '../../site-pages';

export function localizedPath(
  locale: WebsiteLocale,
  page: SitePage = '',
): string {
  const segments: string[] = [];
  if (locale !== 'en') {
    segments.push(locale);
  }
  if (page) {
    segments.push(page);
  }
  return segments.length ? `/${segments.join('/')}` : '/';
}

export function parseSitePath(pathname: string, basename = ''): {
  locale: WebsiteLocale;
  page: SitePage;
} {
  let path = pathname;
  const base = basename.endsWith('/') ? basename.slice(0, -1) : basename;
  if (base && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  path = path.replace(/^\/+|\/+$/g, '');

  const parts = path ? path.split('/') : [];
  let locale: WebsiteLocale = 'en';

  if (parts.length > 0 && isWebsiteLocale(parts[0])) {
    locale = parts[0];
    parts.shift();
  }

  const pageSegment = parts[0] ?? '';
  const page = isSitePage(pageSegment) ? pageSegment : '';

  return { locale, page };
}

export { isSitePage };

export function allSiteLocales(): readonly WebsiteLocale[] {
  return WEBSITE_LOCALES;
}
