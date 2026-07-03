import { describe, expect, it } from 'vitest';
import {
  getActiveFocusMs,
  getDistractionMs,
  isDistractionNudgeDue,
  isRabbitHoleDue,
  startActiveFocus,
  startDistraction,
  stopActiveFocus,
  stopDistraction,
  tickActiveFocus,
  tickDistraction,
} from '../utils/active-time';
import { createSession } from '../utils/session-manager';
import { DEFAULT_SETTINGS } from '../utils/types';

const session = createSession('AWS pricing', ['aws', 'pricing'], DEFAULT_SETTINGS, 0);

describe('startActiveFocus', () => {
  it('records a focus start timestamp', () => {
    const focused = startActiveFocus(session, 1_000);
    expect(focused.focusStartedAt).toBe(1_000);
  });
});

describe('startDistraction', () => {
  it('records a distraction start timestamp', () => {
    const distracted = startDistraction(session, 1_000);
    expect(distracted.distractionStartedAt).toBe(1_000);
  });
});

describe('stopActiveFocus', () => {
  it('accumulates elapsed focus time', () => {
    const focused = startActiveFocus(session, 1_000);
    const stopped = stopActiveFocus(focused, 31_000);

    expect(stopped.activeFocusMs).toBe(30_000);
    expect(stopped.focusStartedAt).toBeNull();
  });
});

describe('stopDistraction', () => {
  it('accumulates elapsed distraction time', () => {
    const distracted = startDistraction(session, 1_000);
    const stopped = stopDistraction(distracted, 61_000);

    expect(stopped.distractionMs).toBe(60_000);
    expect(stopped.distractionStartedAt).toBeNull();
  });
});

describe('tickActiveFocus', () => {
  it('rolls focus forward without stopping', () => {
    const focused = startActiveFocus(session, 1_000);
    const ticked = tickActiveFocus(focused, 11_000);

    expect(ticked.activeFocusMs).toBe(10_000);
    expect(ticked.focusStartedAt).toBe(11_000);
  });
});

describe('tickDistraction', () => {
  it('rolls distraction forward without stopping', () => {
    const distracted = startDistraction(session, 1_000);
    const ticked = tickDistraction(distracted, 11_000);

    expect(ticked.distractionMs).toBe(10_000);
    expect(ticked.distractionStartedAt).toBe(11_000);
  });
});

describe('nudge thresholds', () => {
  it('tracks rabbit-hole and distraction readiness separately', () => {
    const ready = {
      ...session,
      activeFocusMs: 30 * 60_000,
      checkInAfterActiveMs: 30 * 60_000,
      distractionMs: 5 * 60_000,
      nudgeAfterDistractionMs: 5 * 60_000,
    };

    expect(isRabbitHoleDue(ready)).toBe(true);
    expect(isDistractionNudgeDue(ready)).toBe(true);
    expect(getActiveFocusMs(ready)).toBe(30 * 60_000);
    expect(getDistractionMs(ready)).toBe(5 * 60_000);
  });
});
