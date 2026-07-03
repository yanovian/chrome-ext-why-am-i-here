import { getActiveFocusMs, getActiveMinutes } from './active-time';
import type { ExtensionSettings, IntentSession } from './types';
import { DEFAULT_SETTINGS } from './types';

export function formatCheckInHint(
  session: IntentSession,
  settings: ExtensionSettings = DEFAULT_SETTINGS,
): string {
  const activeMs = getActiveFocusMs(session);
  const remaining = Math.max(
    0,
    Math.ceil((session.checkInAfterActiveMs - activeMs) / 60_000),
  );

  if (remaining > 0) {
    if (remaining === 1) {
      return '1 more active minute on related tabs until check-in.';
    }
    return `${remaining} more active minutes on related tabs until check-in.`;
  }

  const openTabs = session.trackedTabIds.length;
  const relatedTabs = session.seenRelatedTabIds.length;

  if (openTabs < settings.tabCountThreshold) {
    const needed = settings.tabCountThreshold - openTabs;
    return `Active time reached. Open ${needed} more tab${needed === 1 ? '' : 's'} (${openTabs}/${settings.tabCountThreshold}).`;
  }

  if (relatedTabs < settings.minRelatedTabs) {
    const needed = settings.minRelatedTabs - relatedTabs;
    return `Active time reached. Open ${needed} more related tab${needed === 1 ? '' : 's'} (${relatedTabs}/${settings.minRelatedTabs}).`;
  }

  return 'Check-in ready — open the extension (look for ! on the icon).';
}

export interface GoalStats {
  activeMinutes: number;
  relatedTabs: number;
  openTabs: number;
}

export function getGoalStats(session: IntentSession): GoalStats {
  return {
    activeMinutes: getActiveMinutes(session),
    relatedTabs: session.relatedTabIds.length,
    openTabs: session.trackedTabIds.length,
  };
}
