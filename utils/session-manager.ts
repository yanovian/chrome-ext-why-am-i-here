import type {
  CheckInResponse,
  ExtensionSettings,
  IntentSession,
  PendingCheckIn,
} from './types';
import { DEFAULT_SETTINGS } from './types';
import { getActiveMinutes } from './active-time';

export function createSession(
  intent: string,
  keywords: string[],
  settings: ExtensionSettings,
  now = Date.now(),
): IntentSession {
  const intervalMs = settings.checkInIntervalMinutes * 60_000;

  return {
    id: crypto.randomUUID(),
    intent: intent.trim(),
    keywords,
    startedAt: now,
    status: 'active',
    activeFocusMs: 0,
    focusStartedAt: null,
    checkInAfterActiveMs: intervalMs,
    trackedTabIds: [],
    relatedTabIds: [],
    seenRelatedTabIds: [],
  };
}

export interface CheckInEvaluationInput {
  session: IntentSession;
  settings: ExtensionSettings;
  totalTabCount: number;
  relatedTabCount: number;
  now?: number;
}

export function shouldSurfaceCheckIn({
  session,
  settings,
  totalTabCount,
  relatedTabCount,
  now = Date.now(),
}: CheckInEvaluationInput): boolean {
  if (session.status !== 'active') {
    return false;
  }

  const activeMs =
    session.activeFocusMs +
    (session.focusStartedAt === null ? 0 : now - session.focusStartedAt);

  if (activeMs < session.checkInAfterActiveMs) {
    return false;
  }

  if (totalTabCount < settings.tabCountThreshold) {
    return false;
  }

  if (relatedTabCount < settings.minRelatedTabs) {
    return false;
  }

  return true;
}

export function buildPendingCheckIn(
  session: IntentSession,
  totalTabCount: number,
  relatedTabCount: number,
  now = Date.now(),
): PendingCheckIn {
  return {
    sessionId: session.id,
    intent: session.intent,
    relatedTabCount,
    totalTabCount,
    activeMinutes: getActiveMinutes(session, now),
    createdAt: now,
  };
}

export function applyCheckInResponse(
  session: IntentSession,
  response: CheckInResponse,
): IntentSession {
  if (response === 'completed') {
    return { ...session, status: 'completed', focusStartedAt: null };
  }

  if (response === 'dismissed') {
    return { ...session, status: 'dismissed', focusStartedAt: null };
  }

  return session;
}

export function snoozeSession(
  session: IntentSession,
  settings: ExtensionSettings,
  now = Date.now(),
): IntentSession {
  const activeMs =
    session.activeFocusMs +
    (session.focusStartedAt === null ? 0 : now - session.focusStartedAt);
  const intervalMs = settings.checkInIntervalMinutes * 60_000;

  return {
    ...session,
    checkInAfterActiveMs: activeMs + intervalMs,
  };
}

export function mergeSettings(
  partial: Partial<ExtensionSettings> | undefined,
): ExtensionSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...partial,
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
    activeFocusMs?: number;
    focusStartedAt?: number | null;
    checkInAfterActiveMs?: number;
    seenRelatedTabIds?: number[];
  };

  const checkInAfterActiveMs =
    raw.checkInAfterActiveMs ??
    (raw.checkInAt
      ? Math.max(0, raw.checkInAt - raw.startedAt)
      : DEFAULT_SETTINGS.checkInIntervalMinutes * 60_000);

  return {
    id: raw.id,
    intent: raw.intent,
    keywords: raw.keywords ?? [],
    startedAt: raw.startedAt,
    status: raw.status ?? 'active',
    activeFocusMs: raw.activeFocusMs ?? 0,
    focusStartedAt: raw.focusStartedAt ?? null,
    checkInAfterActiveMs,
    trackedTabIds: raw.trackedTabIds ?? [],
    relatedTabIds: raw.relatedTabIds ?? [],
    seenRelatedTabIds: raw.seenRelatedTabIds ?? raw.relatedTabIds ?? [],
  };
}
