import { Link } from 'react-router-dom';
import {
  POUYAN_RAZIAN_URL,
  SITE_NAME,
  YANOVIAN_LLC_URL,
} from '../../site-meta';
import { GITHUB_URL } from '@/content';
import { useLocalizedPath } from '@/hooks/useSiteLocale';
import { Trans, useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation('common');
  const path = useLocalizedPath();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <img src={`${import.meta.env.BASE_URL}icon-48.png`} width={32} height={32} alt="" />
          <span>{SITE_NAME}</span>
        </div>
        <p className="footer__tagline">{t('footerTagline')}</p>
        <p className="footer__credit">
          <Trans
            i18nKey="footerCredit"
            t={t}
            components={{
              yanovian: (
                <a href={YANOVIAN_LLC_URL} target="_blank" rel="noopener noreferrer" />
              ),
              pooyan: (
                <a href={POUYAN_RAZIAN_URL} target="_blank" rel="noopener noreferrer" />
              ),
            }}
          />
        </p>
        <nav className="footer__links" aria-label="Footer">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            {t('sourceOnGitHub')}
          </a>
          <Link to={path('privacy')}>{t('privacyLink')}</Link>
        </nav>
        <p className="footer__copy">© {year} {SITE_NAME}</p>
      </div>
    </footer>
  );
}
