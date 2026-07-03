import type {
  CheckInResponse,
  ExtensionSettings,
  FocusNudgeType,
  IntentSession,
  PendingCheckIn,
} from './types';
import { DEFAULT_SETTINGS } from './types';
import {
  getActiveMinutes,
  getDistractionMinutes,
  getDistractionMs,
  getActiveFocusMs,
  stopDistraction,
} from './active-time';

export function createSession(
  intent: string,
  keywords: string[],
  settings: ExtensionSettings,
  now = Date.now(),
): IntentSession {
  return {
    id: crypto.randomUUID(),
    intent: intent.trim(),
    keywords,
    startedAt: now,
    status: 'active',
    activeFocusMs: 0,
    focusStartedAt: null,
    checkInAfterActiveMs: settings.rabbitHoleMinutes * 60_000,
    distractionMs: 0,
    distractionStartedAt: null,
    nudgeAfterDistractionMs: settings.distractionMinutes * 60_000,
    trackedTabIds: [],
    relatedTabIds: [],
    seenRelatedTabIds: [],
    seenUnrelatedTabIds: [],
  };
}

export interface DistractionNudgeInput {
  session: IntentSession;
  settings: ExtensionSettings;
  unrelatedOpenCount: number;
  relatedOpenCount: number;
  now?: number;
}

/** Nudge when user has spent time off-goal and unrelated tabs dominate. */
export function shouldSurfaceDistractionNudge({
  session,
  settings,
  unrelatedOpenCount,
  relatedOpenCount,
  now = Date.now(),
}: DistractionNudgeInput): boolean {
  if (session.status !== 'active') {
    return false;
  }

  if (getDistractionMs(session, now) < session.nudgeAfterDistractionMs) {
    return false;
  }

  return (
    unrelatedOpenCount >= settings.unrelatedTabThreshold &&
    unrelatedOpenCount > relatedOpenCount
  );
}

export interface RabbitHoleNudgeInput {
  session: IntentSession;
  settings: ExtensionSettings;
  totalTabCount: number;
  relatedTabCount: number;
  now?: number;
}

/** Check-in when user has been deep on related tabs with many tabs open. */
export function shouldSurfaceRabbitHoleNudge({
  session,
  settings,
  totalTabCount,
  relatedTabCount,
  now = Date.now(),
}: RabbitHoleNudgeInput): boolean {
  if (session.status !== 'active') {
    return false;
  }

  if (getActiveFocusMs(session, now) < session.checkInAfterActiveMs) {
    return false;
  }

  if (totalTabCount < settings.rabbitHoleTabThreshold) {
    return false;
  }

  if (relatedTabCount < settings.rabbitHoleMinRelatedTabs) {
    return false;
  }

  return true;
}

export function buildPendingCheckIn(
  session: IntentSession,
  type: FocusNudgeType,
  unrelatedTabCount: number,
  totalTabCount: number,
  relatedTabCount: number,
  now = Date.now(),
): PendingCheckIn {
  return {
    sessionId: session.id,
    intent: session.intent,
    type,
    relatedTabCount,
    unrelatedTabCount,
    totalTabCount,
    onGoalMinutes: getActiveMinutes(session, now),
    distractionMinutes: getDistractionMinutes(session, now),
    createdAt: now,
  };
}

export function applyCheckInResponse(
  session: IntentSession,
  response: CheckInResponse,
): IntentSession {
  const stopped = stopDistraction({
    ...session,
    focusStartedAt: null,
  });

  if (response === 'completed') {
    return { ...stopped, status: 'completed' };
  }

  if (response === 'dismissed') {
    return { ...stopped, status: 'dismissed' };
  }

  return stopped;
}

export function snoozeSession(
  session: IntentSession,
  settings: ExtensionSettings,
  nudgeType: FocusNudgeType,
  now = Date.now(),
): IntentSession {
  if (nudgeType === 'distraction') {
    return {
      ...stopDistraction(session, now),
      distractionMs: 0,
      distractionStartedAt: null,
      nudgeAfterDistractionMs: settings.distractionMinutes * 60_000,
    };
  }

  const activeMs = getActiveFocusMs(session, now);
  return {
    ...session,
    checkInAfterActiveMs: activeMs + settings.rabbitHoleMinutes * 60_000,
  };
}

type LegacySettings = Partial<ExtensionSettings> & {
  checkInIntervalMinutes?: number;
  tabCountThreshold?: number;
  minRelatedTabs?: number;
};

export function mergeSettings(
  partial: LegacySettings | undefined,
): ExtensionSettings {
  const legacy = partial ?? {};

  return {
    distractionMinutes: Number(
      legacy.distractionMinutes ?? DEFAULT_SETTINGS.distractionMinutes,
    ),
    unrelatedTabThreshold: Number(
      legacy.unrelatedTabThreshold ?? DEFAULT_SETTINGS.unrelatedTabThreshold,
    ),
    rabbitHoleMinutes: Number(
      legacy.rabbitHoleMinutes ??
        legacy.checkInIntervalMinutes ??
        DEFAULT_SETTINGS.rabbitHoleMinutes,
    ),
    rabbitHoleTabThreshold: Number(
      legacy.rabbitHoleTabThreshold ??
        legacy.tabCountThreshold ??
        DEFAULT_SETTINGS.rabbitHoleTabThreshold,
    ),
    rabbitHoleMinRelatedTabs: Number(
      legacy.rabbitHoleMinRelatedTabs ??
        legacy.minRelatedTabs ??
        DEFAULT_SETTINGS.rabbitHoleMinRelatedTabs,
    ),
  };
}

export function appendSessionHistory(
  history: IntentSession[],
  session: IntentSession,
  maxEntries = 50,
): IntentSession[] {
  return [session, ...history].slice(0, maxEntries);
}

/** Upgrade sessions saved by older builds. */
export function normalizeSession(
  session: IntentSession | Record<string, unknown>,
): IntentSession {
  const raw = session as IntentSession & {
    checkInAt?: number;
    checkInAfterActiveMs?: number;
    seenRelatedTabIds?: number[];
    seenUnrelatedTabIds?: number[];
    distractionMs?: number;
    distractionStartedAt?: number | null;
    nudgeAfterDistractionMs?: number;
  };

  const settings = mergeSettings(undefined);

  const checkInAfterActiveMs =
    raw.checkInAfterActiveMs ??
    (raw.checkInAt
      ? Math.max(0, raw.checkInAt - raw.startedAt)
      : settings.rabbitHoleMinutes * 60_000);

  const nudgeAfterDistractionMs =
    raw.nudgeAfterDistractionMs ?? settings.distractionMinutes * 60_000;

  return {
    id: raw.id,
    intent: raw.intent,
    keywords: raw.keywords ?? [],
    startedAt: raw.startedAt,
    status: raw.status ?? 'active',
    activeFocusMs: raw.activeFocusMs ?? 0,
    focusStartedAt: raw.focusStartedAt ?? null,
    checkInAfterActiveMs,
    distractionMs: raw.distractionMs ?? 0,
    distractionStartedAt: raw.distractionStartedAt ?? null,
    nudgeAfterDistractionMs,
    trackedTabIds: raw.trackedTabIds ?? [],
    relatedTabIds: raw.relatedTabIds ?? [],
    seenRelatedTabIds: raw.seenRelatedTabIds ?? raw.relatedTabIds ?? [],
    seenUnrelatedTabIds: raw.seenUnrelatedTabIds ?? [],
  };
}

/** @deprecated Use shouldSurfaceRabbitHoleNudge */
export const shouldSurfaceCheckIn = shouldSurfaceRabbitHoleNudge;
