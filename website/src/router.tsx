import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
  useParams,
} from 'react-router-dom';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LocaleSync } from '@/components/LocaleSync';
import { SiteHead } from '@/components/SiteHead';
import { ScrollToTop } from '@/components/ScrollToTop';
import { SubPageLayout } from '@/layouts/SubPageLayout';
import { HomePage } from '@/pages/HomePage';
import { LegalMarkdownPage } from '@/pages/LegalMarkdownPage';
import { isWebsiteLocale } from '@/i18n/locales';
import { parseSitePath } from '@/i18n/routes';
import { SUB_PAGE_IDS } from '../site-pages';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

const subPageRoutes = SUB_PAGE_IDS.map((page) => ({
  path: page,
  element: <LegalMarkdownPage page={page} />,
}));

function RootLayout() {
  const { pathname } = useLocation();
  const { page } = parseSitePath(pathname, basename ?? '');

  return (
    <>
      <LocaleSync />
      <SiteHead />
      {page === '' ? (
        <div className="site-chrome">
          <LanguageSwitcher />
        </div>
      ) : null}
      <ScrollToTop />
      <Outlet />
    </>
  );
}

function LocaleLayout() {
  const { locale } = useParams();
  if (!locale || !isWebsiteLocale(locale)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { element: <SubPageLayout />, children: subPageRoutes },
        {
          path: ':locale',
          element: <LocaleLayout />,
          children: [
            { index: true, element: <HomePage /> },
            { element: <SubPageLayout />, children: subPageRoutes },
          ],
        },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ],
  { basename },
);
