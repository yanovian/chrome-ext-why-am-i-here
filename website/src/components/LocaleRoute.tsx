import { Navigate, useParams } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { isWebsiteLocale } from '@/i18n/locales';

type LocaleRouteProps = {
  page: 'home' | 'privacy';
};

export function LocaleRoute({ page }: LocaleRouteProps) {
  const { locale } = useParams();

  if (!locale || !isWebsiteLocale(locale)) {
    return <Navigate to="/" replace />;
  }

  if (page === 'privacy') {
    return <PrivacyPage />;
  }
  return <HomePage />;
}
