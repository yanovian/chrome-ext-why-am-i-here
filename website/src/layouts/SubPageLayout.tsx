import { Link, NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SITE_NAME } from '../../site-meta';
import { Footer } from '@/components/Footer';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { SiteLogo } from '@/components/SiteLogo';
import { Container } from '@/components/ui';
import { useLocalizedPath } from '@/hooks/useSiteLocale';
import { SUB_PAGE_IDS, SUB_PAGES } from '../../site-pages';

export function SubPageLayout() {
  const path = useLocalizedPath();
  const { t } = useTranslation('legal');

  return (
    <>
      <header className="sub-page-header">
        <Container className="sub-page-header__inner">
          <Link className="sub-page-header__brand" to={path()}>
            <SiteLogo size="sm" />
            <span>{SITE_NAME}</span>
          </Link>
          <nav className="sub-page-header__nav" aria-label="Legal">
            {SUB_PAGE_IDS.map((id) => (
              <NavLink key={id} to={path(id)}>
                {t(SUB_PAGES[id].navKey)}
              </NavLink>
            ))}
          </nav>
          <div className="sub-page-header__lang">
            <LanguageSwitcher />
          </div>
        </Container>
      </header>
      <main className="sub-page">
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
    </>
  );
}
