import { Trans, useTranslation } from 'react-i18next';
import privacyMarkdown from '../../../PRIVACY.md?raw';
import { prepareLegalMarkdown, renderMarkdown } from '@/lib/markdown';
import { subPageRepoUrl, type SubPageId } from '../../site-pages';

const MARKDOWN: Record<SubPageId, string> = {
  privacy: privacyMarkdown,
};

type LegalMarkdownPageProps = {
  page: SubPageId;
};

export function LegalMarkdownPage({ page }: LegalMarkdownPageProps) {
  const { t } = useTranslation('legal');
  const html = renderMarkdown(prepareLegalMarkdown(MARKDOWN[page]));

  return (
    <>
      <div className="legal-notice" role="note">
        <p>
          <Trans
            i18nKey="authoritativeNotice"
            ns="legal"
            components={{
              repo: (
                <a
                  href={subPageRepoUrl(page)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
    </>
  );
}
