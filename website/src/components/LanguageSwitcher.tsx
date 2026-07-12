import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { LocaleFlag } from '@/components/LocaleFlag';
import {
  LOCALE_LABELS,
  WEBSITE_LOCALES,
  type WebsiteLocale,
  isWebsiteLocale,
} from '@/i18n/locales';
import { localizedPath, parseSitePath } from '@/i18n/routes';

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('marketing');
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const { locale: pathLocale } = parseSitePath(location.pathname, routerBasename);
  const current = isWebsiteLocale(pathLocale) ? pathLocale : 'en';

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const selectLocale = (locale: WebsiteLocale) => {
    const { page } = parseSitePath(location.pathname, routerBasename);
    navigate(localizedPath(locale, page));
    void i18n.changeLanguage(locale);
    setOpen(false);
  };

  return (
    <div className="language-switcher" ref={containerRef}>
      <span className="language-switcher__label" id={`${listId}-label`}>
        {t('languageLabel')}
      </span>
      <div className="language-switcher__menu-wrap">
        <button
          type="button"
          className="language-switcher__trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={`${listId}-label`}
          onClick={() => setOpen((value) => !value)}
        >
          <LocaleFlag locale={current} className="language-switcher__flag" />
          <span className="language-switcher__current">{LOCALE_LABELS[current]}</span>
          <span className="language-switcher__chevron" aria-hidden="true">
            ▾
          </span>
        </button>
        {open ? (
          <ul
            id={listId}
            className="language-switcher__list"
            role="listbox"
            aria-labelledby={`${listId}-label`}
          >
            {WEBSITE_LOCALES.map((locale) => {
              const selected = locale === current;
              return (
                <li key={locale} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`language-switcher__option${
                      selected ? ' language-switcher__option--selected' : ''
                    }`}
                    onClick={() => selectLocale(locale)}
                  >
                    <LocaleFlag locale={locale} className="language-switcher__flag" />
                    <span>{LOCALE_LABELS[locale]}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
