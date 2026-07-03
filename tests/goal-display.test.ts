import { describe, expect, it } from 'vitest';
import { formatCheckInHint, getGoalStats } from '../utils/goal-display';
import { createSession } from '../utils/session-manager';
import { DEFAULT_SETTINGS } from '../utils/types';

describe('getGoalStats', () => {
  it('returns active minutes, related tabs, and open tabs', () => {
    const session = {
      ...createSession('AWS pricing', ['aws', 'pricing'], DEFAULT_SETTINGS, 0),
      activeFocusMs: 5 * 60_000,
      relatedTabIds: [1, 2, 3],
      trackedTabIds: [1, 2, 3, 4, 5],
      seenRelatedTabIds: [1, 2, 3],
    };

    expect(getGoalStats(session)).toEqual({
      activeMinutes: 5,
      relatedTabs: 3,
      openTabs: 5,
    });
  });
});

describe('formatCheckInHint', () => {
  it('describes remaining active minutes', () => {
    const session = {
      ...createSession('AWS', ['aws'], DEFAULT_SETTINGS, 0),
      activeFocusMs: 10 * 60_000,
      checkInAfterActiveMs: 30 * 60_000,
      focusStartedAt: null,
    };

    expect(formatCheckInHint(session)).toBe('20 more active minutes until check-in.');
  });
});
