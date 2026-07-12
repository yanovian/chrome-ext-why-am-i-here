import {
  absoluteAssetUrl,
  CHROME_STORE_URL,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  POUYAN_RAZIAN_URL,
  SITE_NAME,
  SITE_URL,
  YANOVIAN_LLC_URL,
  ogImagePath,
  sitePageUrl,
} from '../../site-meta';
import { useHead } from '@unhead/react';
import {
  defineSoftwareApp,
  defineWebPage,
  defineWebSite,
  useSchemaOrg,
} from '@unhead/schema-org/react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { SUPPORTED_LANGUAGES, type WebsiteLocale } from '@/i18n';
import { hreflangTag, isRtlLocale, ogLocaleTag } from '@/i18n/locales';
import { parseSitePath } from '@/i18n/routes';

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');

function resolveOgLocale(language: string): string {
  if (SUPPORTED_LANGUAGES.includes(language as WebsiteLocale)) {
    return ogLocaleTag(language as WebsiteLocale);
  }
  return 'en_US';
}

function resolveHtmlLang(language: string): string {
  if (SUPPORTED_LANGUAGES.includes(language as WebsiteLocale)) {
    return hreflangTag(language as WebsiteLocale);
  }
  return 'en';
}

function singleLineMeta(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** Route- and locale-aware document title, meta tags, and schema.org. */
export function SiteHead() {
  const { pathname } = useLocation();
  const { t } = useTranslation('seo');
  const { locale: language, page: legalPage } = parseSitePath(pathname, routerBasename);
  const htmlLang = resolveHtmlLang(language);
  const dir = isRtlLocale(language) ? 'rtl' : 'ltr';
  const locale = resolveOgLocale(language);
  const isHome = legalPage === '';

  const title = singleLineMeta(legalPage ? t(`${legalPage}.title`) : t('title'));
  const description = singleLineMeta(
    legalPage ? t(`${legalPage}.description`) : t('description'),
  );
  const authorName = t('authorName');
  const creatorName = t('creatorName');
  const ogImageAlt = t('ogImageAlt');
  const ogImage = absoluteAssetUrl(ogImagePath(language === 'en' ? undefined : language));
  const canonical = sitePageUrl(legalPage, language === 'en' ? undefined : language);
  const ogType = isHome ? 'website' : 'article';

  const alternateLocales = SUPPORTED_LANGUAGES.filter((code) => code !== language).map(
    (code) => ({
      property: 'og:locale:alternate',
      content: resolveOgLocale(code),
    }),
  );

  const hreflangLinks = SUPPORTED_LANGUAGES.map((code) => ({
    rel: 'alternate' as const,
    hreflang: hreflangTag(code),
    href: sitePageUrl(legalPage, code === 'en' ? undefined : code),
  }));

  useHead(
    {
      htmlAttrs: { lang: htmlLang, dir },
      title,
      meta: [
        { name: 'description', content: description },
        { name: 'author', content: authorName },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: ogType },
        { property: 'og:site_name', content: SITE_NAME },
        { property: 'og:locale', content: locale },
        ...alternateLocales,
        { property: 'og:url', content: canonical },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:image', content: ogImage },
        { property: 'og:image:width', content: String(OG_IMAGE_WIDTH) },
        { property: 'og:image:height', content: String(OG_IMAGE_HEIGHT) },
        { property: 'og:image:alt', content: ogImageAlt },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: ogImage },
        { name: 'twitter:image:alt', content: ogImageAlt },
      ],
      link: [
        { rel: 'canonical', href: canonical },
        { rel: 'apple-touch-icon', href: absoluteAssetUrl('icon.png') },
        ...hreflangLinks,
        { rel: 'alternate', hreflang: 'x-default', href: sitePageUrl(legalPage) },
      ],
    },
    { key: 'site-head' },
  );

  useSchemaOrg(
    isHome
      ? [
          defineWebSite({
            name: SITE_NAME,
            url: SITE_URL,
            inLanguage: htmlLang,
          }),
          defineSoftwareApp({
            name: SITE_NAME,
            applicationCategory: 'BrowserApplication',
            operatingSystem: 'Chrome',
            description,
            url: SITE_URL,
            downloadUrl: CHROME_STORE_URL,
            image: ogImage,
            offers: {
              price: 0,
              priceCurrency: 'USD',
            },
            author: {
              '@type': 'Organization',
              name: authorName,
              url: YANOVIAN_LLC_URL,
            },
            creator: {
              '@type': 'Person',
              name: creatorName,
              url: POUYAN_RAZIAN_URL,
            },
            maintainer: {
              '@type': 'Organization',
              name: authorName,
              url: YANOVIAN_LLC_URL,
            },
          }),
        ]
      : [
          defineWebPage({
            name: title,
            description,
            url: canonical,
            inLanguage: htmlLang,
          }),
        ],
  );

  return null;
}
