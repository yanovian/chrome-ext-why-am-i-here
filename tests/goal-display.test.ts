import { describe, expect, it } from 'vitest';
import { formatCheckInHint, formatNudgeBody, getGoalStats } from '../utils/goal-display';
import { createSession } from '../utils/session-manager';
import { DEFAULT_SETTINGS } from '../utils/types';

describe('getGoalStats', () => {
  it('returns on-goal, distracted, and tab counts', () => {
    const session = {
      ...createSession('AWS pricing', ['aws', 'pricing'], DEFAULT_SETTINGS, 0),
      activeFocusMs: 5 * 60_000,
      distractionMs: 2 * 60_000,
      relatedTabIds: [1, 2],
      trackedTabIds: [1, 2, 3, 4],
      seenRelatedTabIds: [1, 2],
      seenUnrelatedTabIds: [3, 4],
    };

    expect(getGoalStats(session)).toEqual({
      onGoalMinutes: 5,
      distractedMinutes: 2,
      relatedTabs: 2,
      unrelatedTabs: 2,
    });
  });
});

describe('formatCheckInHint', () => {
  it('describes both nudge types', () => {
    const session = {
      ...createSession('AWS', ['aws'], DEFAULT_SETTINGS, 0),
      activeFocusMs: 10 * 60_000,
      distractionMs: 1 * 60_000,
      checkInAfterActiveMs: 30 * 60_000,
      nudgeAfterDistractionMs: 5 * 60_000,
      focusStartedAt: null,
      distractionStartedAt: null,
      relatedTabIds: [1],
      trackedTabIds: [1, 2, 3],
    };

    const hint = formatCheckInHint(session, DEFAULT_SETTINGS);
    expect(hint).toContain('off-goal');
    expect(hint).toContain('rabbit-hole');
  });
});

describe('formatNudgeBody', () => {
  it('formats distraction and rabbit-hole messages differently', () => {
    expect(
      formatNudgeBody({
        type: 'distraction',
        intent: 'AWS',
        onGoalMinutes: 2,
        distractionMinutes: 5,
        relatedTabCount: 1,
        unrelatedTabCount: 4,
        totalTabCount: 5,
      }),
    ).toContain('off “AWS”');

    expect(
      formatNudgeBody({
        type: 'rabbit-hole',
        intent: 'AWS',
        onGoalMinutes: 30,
        distractionMinutes: 0,
        relatedTabCount: 12,
        unrelatedTabCount: 3,
        totalTabCount: 40,
      }),
    ).toContain('Goal completed?');
  });
});
