import { useTranslation } from 'react-i18next';
import { Button, Section } from '@/components/ui';
import { useLocalizedPath } from '@/hooks/useSiteLocale';
import { CHROME_STORE_URL, privacyPointKeys } from '@/content';

export function PrivacyStrip() {
  const { t } = useTranslation('marketing');
  const path = useLocalizedPath();

  return (
    <Section id="privacy" tinted>
      <div className="privacy-strip">
        <div>
          <p className="eyebrow">{t('privacyEyebrow')}</p>
          <h2>{t('privacyTitle')}</h2>
          <ul className="privacy-list">
            {privacyPointKeys.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
          <Button to={path('privacy')} variant="ghost">
            {t('privacyRead')}
          </Button>
        </div>
        <div className="privacy-strip__cta">
          <p>{t('privacyCtaLead')}</p>
          <Button href={CHROME_STORE_URL}>{t('privacyCtaButton')}</Button>
        </div>
      </div>
    </Section>
  );
}
