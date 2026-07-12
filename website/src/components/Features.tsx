import { useTranslation } from 'react-i18next';
import { Section, SectionHeading } from '@/components/ui';
import { featureDefs } from '@/content';

export function Features() {
  const { t } = useTranslation('marketing');

  return (
    <Section id="features" tinted>
      <SectionHeading title={t('featuresTitle')} lead={t('featuresLead')} />
      <ul className="feature-grid">
        {featureDefs.map((feature) => (
          <li key={feature.id} className="feature-card">
            <div className="feature-card__icon" aria-hidden="true">
              {feature.icon}
            </div>
            <div className="feature-card__body">
              <h3>{t(`feature${feature.key}Title`)}</h3>
              <p>{t(`feature${feature.key}Body`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
