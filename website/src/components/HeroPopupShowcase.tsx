import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SiteLogo } from '@/components/SiteLogo';

const SCENES = [
  { id: 'goal', goal: 'AWS pricing', onGoal: 12, distracted: 2, related: 3, unrelated: 1, nudge: false },
  { id: 'distraction', goal: 'AWS pricing', onGoal: 8, distracted: 14, related: 2, unrelated: 5, nudge: true },
  { id: 'rabbit', goal: 'AWS pricing', onGoal: 34, distracted: 3, related: 18, unrelated: 22, nudge: true },
] as const;

const SCENE_MS = 6000;

export function HeroPopupShowcase() {
  const { t } = useTranslation('marketing');
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const scene = SCENES[index]!;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLeaving(true);
      window.setTimeout(() => {
        setIndex((value) => (value + 1) % SCENES.length);
        setLeaving(false);
      }, 500);
    }, SCENE_MS);
    return () => window.clearTimeout(timer);
  }, [index]);

  return (
    <div className="popup-showcase" aria-hidden="true">
      <div className="popup-showcase__glow" />
      <div className={`popup-showcase__card${leaving ? ' popup-showcase__card--leave' : ''}`}>
        <header className="popup-showcase__header">
          <SiteLogo size="md" />
          <div>
            <strong>Why Am I Here?</strong>
            <span>{t('heroEyebrow')}</span>
          </div>
          {scene.nudge ? <span className="popup-showcase__badge">!</span> : null}
        </header>

        <div className="popup-showcase__goal">
          <span className="popup-showcase__label">Current goal</span>
          <p>{scene.goal}</p>
        </div>

        <div className="popup-showcase__stats">
          <div>
            <strong>{scene.onGoal}</strong>
            <span>min on goal</span>
          </div>
          <div>
            <strong>{scene.distracted}</strong>
            <span>min distracted</span>
          </div>
          <div>
            <strong>{scene.related}</strong>
            <span>on-goal tabs</span>
          </div>
          <div>
            <strong>{scene.unrelated}</strong>
            <span>off-goal tabs</span>
          </div>
        </div>

        {scene.nudge ? (
          <div className="popup-showcase__nudge">
            {scene.id === 'distraction'
              ? t('featureDistractionBody').split('.')[0]
              : t('featureRabbitBody').split('.')[0]}
          </div>
        ) : null}
      </div>
    </div>
  );
}
