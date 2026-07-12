import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  LANGUAGE_STORAGE_KEY,
  type WebsiteLocale,
  isWebsiteLocale,
} from '@/i18n/locales';
import { localizedPath, parseSitePath } from '@/i18n/routes';

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Keep i18n and the URL locale prefix in sync. */
export function useSiteLocale(): WebsiteLocale {
  const { locale: localeParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { locale: pathLocale, page } = parseSitePath(location.pathname, routerBasename);

  useEffect(() => {
    if (localeParam) {
      if (!isWebsiteLocale(localeParam)) {
        navigate(localizedPath('en', page), { replace: true });
        return;
      }
      if (i18n.resolvedLanguage !== localeParam) {
        void i18n.changeLanguage(localeParam);
      }
      return;
    }

    if (i18n.resolvedLanguage !== pathLocale) {
      void i18n.changeLanguage(pathLocale);
    }
  }, [i18n, localeParam, navigate, page, pathLocale]);

  useEffect(() => {
    if (localeParam) {
      return;
    }

    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (!stored || stored === 'en' || !isWebsiteLocale(stored)) {
      return;
    }

    if (pathLocale !== 'en') {
      return;
    }

    navigate(localizedPath(stored, page), { replace: true });
    // Redirect once on first load when a saved non-English locale exists.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return localeParam && isWebsiteLocale(localeParam) ? localeParam : pathLocale;
}

export function useLocalizedPath(): (page?: import('@/i18n/routes').SitePage) => string {
  const locale = useSiteLocale();
  return (page = '') => localizedPath(locale, page);
}
