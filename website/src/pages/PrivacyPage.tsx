import privacyMarkdown from '../../../PRIVACY.md?raw';
import { LegalPage } from '@/components/LegalPage';
import { PRIVACY_REPO_URL } from '@/content';

export function PrivacyPage() {
  return (
    <LegalPage
      repoUrl={PRIVACY_REPO_URL}
      markdown={privacyMarkdown}
    />
  );
}
