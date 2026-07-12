import { useSiteLocale } from '@/hooks/useSiteLocale';

/** Mount once to sync the URL locale prefix with i18n. */
export function LocaleSync() {
  useSiteLocale();
  return null;
}
