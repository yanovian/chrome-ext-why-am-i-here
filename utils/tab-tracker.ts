import { isTabRelatedToIntent } from './intent-matcher';
import type { IntentSession } from './types';

const INTERNAL_URL_PREFIXES = [
  'chrome://',
  'chrome-extension://',
  'edge://',
  'about:',
  'devtools://',
];

export interface TabSnapshotInput {
  id?: number;
  title?: string;
  url?: string;
}

export function isTrackableUrl(url: string | undefined): url is string {
  if (!url) {
    return false;
  }

  return !INTERNAL_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

function tabMatchesIntent(
  tab: TabSnapshotInput,
  keywords: string[],
): boolean {
  return isTabRelatedToIntent(
    { title: tab.title ?? '', url: tab.url ?? '' },
    keywords,
  );
}

/** Update session tab counts from a live tab list. */
export function applyTabSnapshot(
  session: IntentSession,
  tabs: TabSnapshotInput[],
): IntentSession {
  const trackableTabs = tabs.filter((tab) => isTrackableUrl(tab.url));

  const trackedTabIds = trackableTabs
    .map((tab) => tab.id)
    .filter((id): id is number => typeof id === 'number');

  const relatedTabIds = trackableTabs
    .filter((tab) => tabMatchesIntent(tab, session.keywords))
    .map((tab) => tab.id)
    .filter((id): id is number => typeof id === 'number');

  const unrelatedTabIds = trackableTabs
    .filter((tab) => !tabMatchesIntent(tab, session.keywords))
    .map((tab) => tab.id)
    .filter((id): id is number => typeof id === 'number');

  const seenRelatedTabIds = [
    ...new Set([...session.seenRelatedTabIds, ...relatedTabIds]),
  ];
  const seenUnrelatedTabIds = [
    ...new Set([...session.seenUnrelatedTabIds, ...unrelatedTabIds]),
  ];

  return {
    ...session,
    trackedTabIds,
    relatedTabIds,
    seenRelatedTabIds,
    seenUnrelatedTabIds,
  };
}

export function getUnrelatedTabIds(session: IntentSession): number[] {
  return session.trackedTabIds.filter(
    (id) => !session.relatedTabIds.includes(id),
  );
}

export async function queryTabs(): Promise<TabSnapshotInput[]> {
  return browser.tabs.query({});
}

export async function refreshSessionFromOpenTabs(
  session: IntentSession,
): Promise<IntentSession> {
  const tabs = await queryTabs();
  return applyTabSnapshot(session, tabs);
}
