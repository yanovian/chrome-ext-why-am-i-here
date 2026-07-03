import {
  getActiveFocusMs,
  getActiveMinutes,
  getDistractionMinutes,
  getDistractionMs,
} from './active-time';
import { getUnrelatedTabIds } from './tab-tracker';
import type { ExtensionSettings, IntentSession } from './types';
import { DEFAULT_SETTINGS } from './types';

export function formatCheckInHint(
  session: IntentSession,
  settings: ExtensionSettings = DEFAULT_SETTINGS,
): string {
  const onGoalRemaining = Math.max(
    0,
    Math.ceil(
      (session.checkInAfterActiveMs - getActiveFocusMs(session)) / 60_000,
    ),
  );
  const distractionRemaining = Math.max(
    0,
    Math.ceil(
      (session.nudgeAfterDistractionMs - getDistractionMs(session)) / 60_000,
    ),
  );

  const unrelatedOpen = getUnrelatedTabIds(session).length;
  const relatedOpen = session.relatedTabIds.length;

  const parts: string[] = [];

  if (distractionRemaining > 0) {
    parts.push(
      distractionRemaining === 1
        ? '1 min off-goal before a focus nudge'
        : `${distractionRemaining} min off-goal before a focus nudge`,
    );
  } else if (
    unrelatedOpen >= settings.unrelatedTabThreshold &&
    unrelatedOpen > relatedOpen
  ) {
    parts.push('Focus nudge ready if you stay off-goal');
  }

  if (onGoalRemaining > 0) {
    parts.push(
      onGoalRemaining === 1
        ? '1 on-goal min until rabbit-hole check-in'
        : `${onGoalRemaining} on-goal min until rabbit-hole check-in`,
    );
  } else {
    const relatedSeen = session.seenRelatedTabIds.length;
    if (
      session.trackedTabIds.length < settings.rabbitHoleTabThreshold ||
      relatedSeen < settings.rabbitHoleMinRelatedTabs
    ) {
      parts.push('Rabbit-hole check-in waiting on tab thresholds');
    } else {
      parts.push('Rabbit-hole check-in ready');
    }
  }

  return parts.join(' · ');
}

export interface GoalStats {
  onGoalMinutes: number;
  distractedMinutes: number;
  relatedTabs: number;
  unrelatedTabs: number;
}

export function getGoalStats(session: IntentSession): GoalStats {
  return {
    onGoalMinutes: getActiveMinutes(session),
    distractedMinutes: getDistractionMinutes(session),
    relatedTabs: session.relatedTabIds.length,
    unrelatedTabs: getUnrelatedTabIds(session).length,
  };
}

export function formatNudgeBody(pending: {
  type: 'distraction' | 'rabbit-hole';
  intent: string;
  onGoalMinutes: number;
  distractionMinutes: number;
  relatedTabCount: number;
  unrelatedTabCount: number;
  totalTabCount: number;
}): string {
  if (pending.type === 'distraction') {
    return `You spent ${pending.distractionMinutes} min off “${pending.intent}” with ${pending.unrelatedTabCount} unrelated tabs open (${pending.relatedTabCount} on-goal). Ready to refocus?`;
  }

  return `You spent ${pending.onGoalMinutes} min on “${pending.intent}” and opened ${pending.relatedTabCount} related tabs (${pending.totalTabCount} total). Goal completed?`;
}

export function formatNudgeTitle(type: 'distraction' | 'rabbit-hole'): string {
  return type === 'distraction' ? 'Time to refocus' : 'Rabbit hole check-in';
}
