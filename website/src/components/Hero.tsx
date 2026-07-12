import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { HeroPopupShowcase } from '@/components/HeroPopupShowcase';
import { CHROME_STORE_URL } from '@/content';

export function Hero() {
  const { t } = useTranslation('marketing');

  return (
    <section className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <div className="container hero__grid">
        <div className="hero__copy">
          <img className="hero__logo" src={`${import.meta.env.BASE_URL}icon.png`} width={72} height={72} alt="" />
          <p className="eyebrow">{t('heroEyebrow')}</p>
          <h1>
            {t('heroTitle')}
            <span className="hero__accent">{t('heroTitleAccent')}</span>
          </h1>
          <p className="hero__lead">{t('heroLead')}</p>
          <div className="hero__actions">
            <Button href={CHROME_STORE_URL}>{t('heroInstall')}</Button>
            <Button href="#features" variant="ghost" external={false}>
              {t('heroFeatures')}
            </Button>
          </div>
        </div>

        <HeroPopupShowcase />
      </div>
    </section>
  );
}
