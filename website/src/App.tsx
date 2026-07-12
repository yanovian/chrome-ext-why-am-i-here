import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LocaleRoute } from '@/components/LocaleRoute';
import { LocaleSync } from '@/components/LocaleSync';
import { SiteHead } from '@/components/SiteHead';
import { ScrollToTop } from '@/components/ScrollToTop';
import { HomePage } from '@/pages/HomePage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { parseSitePath } from '@/i18n/routes';

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

function FloatingLanguageSwitcher() {
  const { pathname } = useLocation();
  const { page } = parseSitePath(pathname, routerBasename ?? '');
  if (page !== '') {
    return null;
  }
  return (
    <div className="site-chrome">
      <LanguageSwitcher />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <LocaleSync />
      <SiteHead />
      <FloatingLanguageSwitcher />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/:locale" element={<LocaleRoute page="home" />} />
        <Route path="/:locale/privacy" element={<LocaleRoute page="privacy" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
