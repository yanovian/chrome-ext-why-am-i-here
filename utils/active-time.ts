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

/** Stop counting on-goal focus time. */
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

/** Start counting on-goal focus time. */
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

/** Add elapsed distraction time since distractionStartedAt. */
export function tickDistraction(
  session: IntentSession,
  now = Date.now(),
): IntentSession {
  if (session.distractionStartedAt === null) {
    return session;
  }

  return {
    ...session,
    distractionMs: session.distractionMs + (now - session.distractionStartedAt),
    distractionStartedAt: now,
  };
}

/** Stop counting off-goal distraction time. */
export function stopDistraction(
  session: IntentSession,
  now = Date.now(),
): IntentSession {
  if (session.distractionStartedAt === null) {
    return session;
  }

  return {
    ...session,
    distractionMs: session.distractionMs + (now - session.distractionStartedAt),
    distractionStartedAt: null,
  };
}

/** Start counting off-goal distraction time. */
export function startDistraction(
  session: IntentSession,
  now = Date.now(),
): IntentSession {
  if (session.distractionStartedAt !== null) {
    return tickDistraction(session, now);
  }

  return {
    ...session,
    distractionStartedAt: now,
  };
}

export function getActiveMinutes(session: IntentSession, now = Date.now()): number {
  return Math.floor(getActiveFocusMs(session, now) / 60_000);
}

export function getDistractionMinutes(
  session: IntentSession,
  now = Date.now(),
): number {
  return Math.floor(getDistractionMs(session, now) / 60_000);
}

export function getActiveFocusMs(session: IntentSession, now = Date.now()): number {
  return (
    session.activeFocusMs +
    (session.focusStartedAt === null ? 0 : now - session.focusStartedAt)
  );
}

export function getDistractionMs(session: IntentSession, now = Date.now()): number {
  return (
    session.distractionMs +
    (session.distractionStartedAt === null ? 0 : now - session.distractionStartedAt)
  );
}

export function isRabbitHoleDue(session: IntentSession, now = Date.now()): boolean {
  return getActiveFocusMs(session, now) >= session.checkInAfterActiveMs;
}

export function isDistractionNudgeDue(
  session: IntentSession,
  now = Date.now(),
): boolean {
  return getDistractionMs(session, now) >= session.nudgeAfterDistractionMs;
}
