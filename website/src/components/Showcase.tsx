import { useTranslation } from 'react-i18next';
import { Section } from '@/components/ui';
import { reminderDefs } from '@/content';

export function Showcase() {
  const { t } = useTranslation('marketing');

  return (
    <Section tinted>
      <div className="showcase">
        <div>
          <p className="eyebrow">{t('showcaseEyebrow')}</p>
          <h2>{t('showcaseTitle')}</h2>
          <p>{t('showcaseBody')}</p>
          <div className="reminder-pills">
            {reminderDefs.map((reminder) => (
              <span key={reminder.key} className={`reminder-pill reminder-pill--${reminder.tone}`}>
                {t(`reminder${reminder.key}`)}
              </span>
            ))}
          </div>
        </div>
        <div className="showcase__frame">
          <div className="comparison-table">
            <div className="comparison-table__row comparison-table__row--head">
              <span />
              <span>{t('reminderDistraction')}</span>
              <span>{t('reminderRabbit')}</span>
            </div>
            <div className="comparison-table__row">
              <span>{t('featureDistractionTitle')}</span>
              <span className="comparison-table__yes">✓</span>
              <span className="comparison-table__no">—</span>
            </div>
            <div className="comparison-table__row">
              <span>{t('featureRabbitTitle')}</span>
              <span className="comparison-table__no">—</span>
              <span className="comparison-table__yes">✓</span>
            </div>
          </div>
          <p className="showcase__caption">{t('featuresLead')}</p>
        </div>
      </div>
    </Section>
  );
}
