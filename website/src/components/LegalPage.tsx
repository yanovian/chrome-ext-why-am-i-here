import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Footer } from '@/components/Footer';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Container } from '@/components/ui';
import { useLocalizedPath } from '@/hooks/useSiteLocale';
import { prepareLegalMarkdown, renderMarkdown } from '@/lib/markdown';
import { SITE_NAME } from '@/content';

type LegalPageProps = {
  repoUrl: string;
  markdown: string;
};

export function LegalPage({ repoUrl, markdown }: LegalPageProps) {
  const { t } = useTranslation('legal');
  const path = useLocalizedPath();
  const html = renderMarkdown(prepareLegalMarkdown(markdown));

  return (
    <>
      <header className="legal-header">
        <Container className="legal-header__inner">
          <Link className="legal-header__brand" to={path()}>
            <img src="icon-48.png" width={28} height={28} alt="" />
            <span>{SITE_NAME}</span>
          </Link>
          <nav className="legal-header__nav" aria-label="Legal">
            <Link to={path('privacy')}>{t('privacyNav')}</Link>
          </nav>
          <div className="legal-header__lang">
            <LanguageSwitcher />
          </div>
        </Container>
      </header>
      <main className="legal-page">
        <Container>
          <div className="legal-notice" role="note">
            <p>
              <Trans
                i18nKey="authoritativeNotice"
                t={t}
                components={{
                  repo: (
                    <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                      {t('repoLinkText')}
                    </a>
                  ),
                }}
              />
            </p>
          </div>
          <article
            className="legal-doc"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Container>
      </main>
      <Footer />
    </>
  );
}
