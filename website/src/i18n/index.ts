import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import {
  LANGUAGE_STORAGE_KEY,
  WEBSITE_LOCALES,
  type WebsiteLocale,
} from '@/i18n/locales';
import { parseSitePath } from '@/i18n/routes';

const localeModules = import.meta.glob('../locales/*/*.json', { eager: true });
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');

const pathLanguageDetector = {
  name: 'path',
  lookup(): WebsiteLocale {
    return parseSitePath(window.location.pathname, routerBasename).locale;
  },
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(pathLanguageDetector);

type Namespace = 'marketing' | 'common' | 'legal' | 'seo';
const NAMESPACES: Namespace[] = ['marketing', 'common', 'legal', 'seo'];

function buildResources() {
  const resources: Record<string, Partial<Record<Namespace, Record<string, unknown>>>> = {};

  for (const [path, module] of Object.entries(localeModules)) {
    const match = path.match(/\/locales\/([^/]+)\/([^/]+)\.json$/);
    if (!match) {
      continue;
    }
    const [, locale, ns] = match;
    if (!resources[locale]) {
      resources[locale] = {};
    }
    resources[locale][ns as Namespace] = (module as { default: Record<string, unknown> }).default;
  }

  return resources;
}

void i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: buildResources(),
    ns: NAMESPACES,
    defaultNS: 'marketing',
    fallbackLng: 'en',
    supportedLngs: [...WEBSITE_LOCALES],
    nonExplicitSupportedLngs: false,
    load: 'currentOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['path', 'localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

export { WEBSITE_LOCALES as SUPPORTED_LANGUAGES };
export type { WebsiteLocale };
export default i18n;
