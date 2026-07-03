import { describe, expect, it } from 'vitest';
import {
  getActiveMinutes,
  getDistractionMinutes,
  startActiveFocus,
  stopActiveFocus,
} from '../utils/active-time';
import {
  appendSessionHistory,
  applyCheckInResponse,
  buildPendingCheckIn,
  createSession,
  normalizeSession,
  shouldSurfaceDistractionNudge,
  shouldSurfaceRabbitHoleNudge,
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
  it('starts with zero focus and distraction time', () => {
    expect(baseSession.activeFocusMs).toBe(0);
    expect(baseSession.distractionMs).toBe(0);
    expect(baseSession.checkInAfterActiveMs).toBe(
      DEFAULT_SETTINGS.rabbitHoleMinutes * 60_000,
    );
    expect(baseSession.nudgeAfterDistractionMs).toBe(
      DEFAULT_SETTINGS.distractionMinutes * 60_000,
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

describe('shouldSurfaceDistractionNudge', () => {
  it('requires off-goal time and unrelated tabs leading', () => {
    const ready = {
      ...baseSession,
      distractionMs: DEFAULT_SETTINGS.distractionMinutes * 60_000,
    };

    expect(
      shouldSurfaceDistractionNudge({
        session: ready,
        settings: DEFAULT_SETTINGS,
        unrelatedOpenCount: 3,
        relatedOpenCount: 1,
      }),
    ).toBe(true);
  });

  it('does not surface when on-goal tabs dominate', () => {
    const ready = {
      ...baseSession,
      distractionMs: DEFAULT_SETTINGS.distractionMinutes * 60_000,
    };

    expect(
      shouldSurfaceDistractionNudge({
        session: ready,
        settings: DEFAULT_SETTINGS,
        unrelatedOpenCount: 1,
        relatedOpenCount: 3,
      }),
    ).toBe(false);
  });
});

describe('shouldSurfaceRabbitHoleNudge', () => {
  it('requires on-goal minutes, tab count, and related tabs', () => {
    const ready = {
      ...baseSession,
      activeFocusMs: DEFAULT_SETTINGS.rabbitHoleMinutes * 60_000,
      seenRelatedTabIds: Array.from({ length: 17 }, (_, index) => index + 1),
      relatedTabIds: [1, 2, 3],
    };

    expect(
      shouldSurfaceRabbitHoleNudge({
        session: ready,
        settings: DEFAULT_SETTINGS,
        totalTabCount: 40,
        relatedTabCount: ready.seenRelatedTabIds.length,
      }),
    ).toBe(true);
  });

  it('does not surface before enough on-goal minutes', () => {
    expect(
      shouldSurfaceRabbitHoleNudge({
        session: baseSession,
        settings: DEFAULT_SETTINGS,
        totalTabCount: 40,
        relatedTabCount: 10,
      }),
    ).toBe(false);
  });
});

describe('buildPendingCheckIn', () => {
  it('captures both on-goal and distraction minutes', () => {
    const session = {
      ...baseSession,
      activeFocusMs: 30 * 60_000,
      distractionMs: 5 * 60_000,
      seenRelatedTabIds: [1, 2, 3],
    };
    const pending = buildPendingCheckIn(session, 'rabbit-hole', 2, 40, 3, 9_000);

    expect(pending.onGoalMinutes).toBe(30);
    expect(pending.distractionMinutes).toBe(5);
    expect(pending.relatedTabCount).toBe(3);
    expect(pending.type).toBe('rabbit-hole');
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
  it('resets distraction tracking for distraction nudges', () => {
    const distracted = {
      ...baseSession,
      distractionMs: 10 * 60_000,
      distractionStartedAt: 5_000,
    };
    const snoozed = snoozeSession(distracted, DEFAULT_SETTINGS, 'distraction', 5_000);

    expect(snoozed.distractionMs).toBe(0);
    expect(snoozed.nudgeAfterDistractionMs).toBe(
      DEFAULT_SETTINGS.distractionMinutes * 60_000,
    );
  });

  it('extends the on-goal threshold for rabbit-hole nudges', () => {
    const active = {
      ...baseSession,
      activeFocusMs: 10 * 60_000,
    };
    const snoozed = snoozeSession(active, DEFAULT_SETTINGS, 'rabbit-hole', 5_000);

    expect(snoozed.checkInAfterActiveMs).toBe(
      active.activeFocusMs + DEFAULT_SETTINGS.rabbitHoleMinutes * 60_000,
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
    expect(legacy.nudgeAfterDistractionMs).toBe(
      DEFAULT_SETTINGS.distractionMinutes * 60_000,
    );
    expect(legacy.seenRelatedTabIds).toEqual([1]);
    expect(legacy.seenUnrelatedTabIds).toEqual([]);
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

describe('distraction minutes', () => {
  it('reads distraction time from session state', () => {
    const distracted = {
      ...baseSession,
      distractionMs: 3 * 60_000,
    };

    expect(getDistractionMinutes(distracted)).toBe(3);
  });
});
