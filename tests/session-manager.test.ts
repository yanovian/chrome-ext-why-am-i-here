import { describe, expect, it } from 'vitest';
import {
  getActiveMinutes,
  startActiveFocus,
  stopActiveFocus,
} from '../utils/active-time';
import {
  appendSessionHistory,
  applyCheckInResponse,
  buildPendingCheckIn,
  createSession,
  normalizeSession,
  shouldSurfaceCheckIn,
  snoozeSession,
} from '../utils/session-manager';
import { DEFAULT_SETTINGS } from '../utils/types';

const baseSession = createSession(
  'Looking for AWS pricing',
  ['aws', 'pricing'],
  DEFAULT_SETTINGS,
  1_000,
);

describe('createSession', () => {
  it('starts with zero active focus time', () => {
    expect(baseSession.activeFocusMs).toBe(0);
    expect(baseSession.focusStartedAt).toBeNull();
    expect(baseSession.checkInAfterActiveMs).toBe(
      DEFAULT_SETTINGS.checkInIntervalMinutes * 60_000,
    );
  });
});

describe('active focus time', () => {
  it('counts only while focus is active', () => {
    const focused = startActiveFocus(baseSession, 1_000);
    const stopped = stopActiveFocus(focused, 61_000);

    expect(getActiveMinutes(stopped, 61_000)).toBe(1);
  });
});

describe('shouldSurfaceCheckIn', () => {
  it('requires active minutes, tab count, and related tabs', () => {
    const ready = {
      ...baseSession,
      activeFocusMs: DEFAULT_SETTINGS.checkInIntervalMinutes * 60_000,
      seenRelatedTabIds: Array.from({ length: 17 }, (_, index) => index + 1),
      relatedTabIds: [1, 2, 3],
    };

    expect(
      shouldSurfaceCheckIn({
        session: ready,
        settings: DEFAULT_SETTINGS,
        totalTabCount: 40,
        relatedTabCount: ready.seenRelatedTabIds.length,
      }),
    ).toBe(true);
  });

  it('does not surface before enough active minutes', () => {
    expect(
      shouldSurfaceCheckIn({
        session: baseSession,
        settings: DEFAULT_SETTINGS,
        totalTabCount: 40,
        relatedTabCount: 10,
      }),
    ).toBe(false);
  });
});

describe('buildPendingCheckIn', () => {
  it('captures active minutes and counts', () => {
    const session = {
      ...baseSession,
      activeFocusMs: 30 * 60_000,
      seenRelatedTabIds: [1, 2, 3],
    };
    const pending = buildPendingCheckIn(session, 40, 3, 9_000);

    expect(pending.activeMinutes).toBe(30);
    expect(pending.relatedTabCount).toBe(3);
  });
});

describe('applyCheckInResponse', () => {
  it('marks completed and dismissed sessions', () => {
    expect(applyCheckInResponse(baseSession, 'completed').status).toBe('completed');
    expect(applyCheckInResponse(baseSession, 'dismissed').status).toBe('dismissed');
    expect(applyCheckInResponse(baseSession, 'continue').status).toBe('active');
  });
});

describe('snoozeSession', () => {
  it('extends the active-minute threshold', () => {
    const active = {
      ...baseSession,
      activeFocusMs: 10 * 60_000,
    };
    const snoozed = snoozeSession(active, DEFAULT_SETTINGS, 5_000);

    expect(snoozed.checkInAfterActiveMs).toBe(
      active.activeFocusMs + DEFAULT_SETTINGS.checkInIntervalMinutes * 60_000,
    );
  });
});

describe('normalizeSession', () => {
  it('migrates legacy sessions with checkInAt', () => {
    const legacy = normalizeSession({
      id: 'legacy',
      intent: 'AWS',
      keywords: ['aws'],
      startedAt: 1_000,
      checkInAt: 1_000 + 30 * 60_000,
      status: 'active',
      trackedTabIds: [],
      relatedTabIds: [1],
    });

    expect(legacy.checkInAfterActiveMs).toBe(30 * 60_000);
    expect(legacy.seenRelatedTabIds).toEqual([1]);
  });
});

describe('appendSessionHistory', () => {
  it('prepends and caps history length', () => {
    const first = { ...baseSession, id: 'one' };
    const second = { ...baseSession, id: 'two' };
    const third = { ...baseSession, id: 'three' };

    const history = appendSessionHistory(
      appendSessionHistory([], first),
      second,
      2,
    );

    expect(history.map((entry) => entry.id)).toEqual(['two', 'one']);
    expect(appendSessionHistory(history, third, 2).map((entry) => entry.id)).toEqual([
      'three',
      'two',
    ]);
  });
});
