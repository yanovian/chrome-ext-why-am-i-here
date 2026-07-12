/** Website locale list (39 languages). */
export const WEBSITE_LOCALES = [
  'en',
  'es',
  'fr',
  'de',
  'it',
  'pt_BR',
  'nl',
  'pl',
  'ru',
  'uk',
  'hy',
  'tr',
  'ar',
  'fa',
  'hi',
  'bn',
  'ta',
  'ja',
  'ko',
  'zh_CN',
  'vi',
  'th',
  'id',
  'ms',
  'fil',
  'sw',
  'sv',
  'da',
  'no',
  'fi',
  'cs',
  'sk',
  'hu',
  'ro',
  'bg',
  'el',
  'hr',
  'sr',
  'ca',
] as const;

export type WebsiteLocale = (typeof WEBSITE_LOCALES)[number];

export const LOCALE_LABELS: Record<WebsiteLocale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt_BR: 'Português (Brasil)',
  nl: 'Nederlands',
  pl: 'Polski',
  ru: 'Русский',
  uk: 'Українська',
  hy: 'Հայերեն',
  tr: 'Türkçe',
  ar: 'العربية',
  fa: 'فارسی',
  hi: 'हिन्दी',
  bn: 'বাংলা',
  ta: 'தமிழ்',
  ja: '日本語',
  ko: '한국어',
  zh_CN: '简体中文',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
  fil: 'Filipino',
  sw: 'Kiswahili',
  sv: 'Svenska',
  da: 'Dansk',
  no: 'Norsk',
  fi: 'Suomi',
  cs: 'Čeština',
  sk: 'Slovenčina',
  hu: 'Magyar',
  ro: 'Română',
  bg: 'Български',
  el: 'Ελληνικά',
  hr: 'Hrvatski',
  sr: 'Српски',
  ca: 'Català',
};

export const LOCALE_COUNTRY_CODES: Record<WebsiteLocale, string> = {
  en: 'US',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  it: 'IT',
  pt_BR: 'BR',
  nl: 'NL',
  pl: 'PL',
  ru: 'RU',
  uk: 'UA',
  hy: 'AM',
  tr: 'TR',
  ar: 'SA',
  fa: 'IR',
  hi: 'IN',
  bn: 'BD',
  ta: 'IN',
  ja: 'JP',
  ko: 'KR',
  zh_CN: 'CN',
  vi: 'VN',
  th: 'TH',
  id: 'ID',
  ms: 'MY',
  fil: 'PH',
  sw: 'KE',
  sv: 'SE',
  da: 'DK',
  no: 'NO',
  fi: 'FI',
  cs: 'CZ',
  sk: 'SK',
  hu: 'HU',
  ro: 'RO',
  bg: 'BG',
  el: 'GR',
  hr: 'HR',
  sr: 'RS',
  ca: 'ES',
};

export const RTL_LOCALES = new Set<WebsiteLocale>(['ar', 'fa']);

export const LANGUAGE_STORAGE_KEY = 'why-am-i-here-website-lang';

export function isWebsiteLocale(value: string): value is WebsiteLocale {
  return (WEBSITE_LOCALES as readonly string[]).includes(value);
}

export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.has(locale as WebsiteLocale);
}

export function hreflangTag(locale: WebsiteLocale): string {
  return locale.replace('_', '-');
}

export function ogLocaleTag(locale: WebsiteLocale): string {
  if (locale === 'en') {
    return 'en_US';
  }
  const [lang, region] = locale.split('_');
  return region ? `${lang}_${region.toUpperCase()}` : `${lang}_${lang.toUpperCase()}`;
}
