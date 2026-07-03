import type { IntentSession } from './types';

/** Add elapsed focus time since focusStartedAt. */
export function tickActiveFocus(
  session: IntentSession,
  now = Date.now(),
): IntentSession {
  if (session.focusStartedAt === null) {
    return session;
  }

  return {
    ...session,
    activeFocusMs: session.activeFocusMs + (now - session.focusStartedAt),
    focusStartedAt: now,
  };
}

/** Stop counting focus time. */
export function stopActiveFocus(
  session: IntentSession,
  now = Date.now(),
): IntentSession {
  if (session.focusStartedAt === null) {
    return session;
  }

  return {
    ...session,
    activeFocusMs: session.activeFocusMs + (now - session.focusStartedAt),
    focusStartedAt: null,
  };
}

/** Start counting focus time on a related tab. */
export function startActiveFocus(
  session: IntentSession,
  now = Date.now(),
): IntentSession {
  if (session.focusStartedAt !== null) {
    return tickActiveFocus(session, now);
  }

  return {
    ...session,
    focusStartedAt: now,
  };
}

export function getActiveMinutes(session: IntentSession, now = Date.now()): number {
  const totalMs =
    session.activeFocusMs +
    (session.focusStartedAt === null ? 0 : now - session.focusStartedAt);

  return Math.floor(totalMs / 60_000);
}

export function getActiveFocusMs(session: IntentSession, now = Date.now()): number {
  return (
    session.activeFocusMs +
    (session.focusStartedAt === null ? 0 : now - session.focusStartedAt)
  );
}

export function isCheckInDue(session: IntentSession, now = Date.now()): boolean {
  return getActiveFocusMs(session, now) >= session.checkInAfterActiveMs;
}

export function formatActiveDuration(session: IntentSession, now = Date.now()): string {
  const minutes = getActiveMinutes(session, now);
  if (minutes <= 0) {
    return 'Under 1 min active';
  }
  if (minutes === 1) {
    return '1 min active';
  }
  return `${minutes} min active`;
}
