import { getActiveMinutes } from './active-time';
import type { IntentSession } from './types';

export function formatCheckInHint(session: IntentSession): string {
  const activeMs =
    session.activeFocusMs +
    (session.focusStartedAt === null ? 0 : Date.now() - session.focusStartedAt);
  const remaining = Math.max(
    0,
    Math.ceil((session.checkInAfterActiveMs - activeMs) / 60_000),
  );

  if (remaining <= 0) {
    return 'Check-in ready when tab thresholds are met.';
  }

  if (remaining === 1) {
    return '1 more active minute until check-in.';
  }

  return `${remaining} more active minutes until check-in.`;
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
