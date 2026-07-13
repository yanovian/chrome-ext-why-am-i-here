import { useTranslation } from 'react-i18next';
import { Section } from '@/components/ui';
import {
  YANOVIAN_PROJECTS_URL,
  yanovianSiblingProducts,
} from '../../yanovian-products';

export function RelatedProducts() {
  const { t } = useTranslation('common');
  const siblings = yanovianSiblingProducts();

  return (
    <Section id="more-from-yanovian">
      <div className="sibling-strip">
        <p className="eyebrow">{t('relatedEyebrow')}</p>
        <h2>{t('relatedTitle')}</h2>
        <ul className="sibling-strip__grid">
          {siblings.map((product) => (
            <li key={product.id}>
              <a
                className="showcase__frame sibling-tile"
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={product.iconUrl} width={80} height={80} alt="" />
                <div className="sibling-tile__body">
                  <h3>{product.name}</h3>
                  <p>{t(product.descKey)}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="sibling-projects">
        <a
          className="sibling-projects__link"
          href={YANOVIAN_PROJECTS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('relatedAllProjects')}
        </a>
      </p>
    </Section>
  );
}
