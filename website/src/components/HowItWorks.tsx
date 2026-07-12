import { useTranslation } from 'react-i18next';
import { Section, SectionHeading } from '@/components/ui';
import { stepDefs } from '@/content';

export function HowItWorks() {
  const { t } = useTranslation('marketing');

  return (
    <Section id="how-it-works">
      <SectionHeading title={t('howTitle')} lead={t('howLead')} />
      <ol className="steps">
        {stepDefs.map((step, index) => (
          <li key={step.id} className="step-card">
            <span className="step-card__number">{index + 1}</span>
            <div>
              <h3>{t(`step${step.key}Title`)}</h3>
              <p>{t(`step${step.key}Body`)}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
