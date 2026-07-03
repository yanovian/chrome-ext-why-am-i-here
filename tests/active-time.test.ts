import { describe, expect, it } from 'vitest';
import {
  getActiveFocusMs,
  isCheckInDue,
  startActiveFocus,
  stopActiveFocus,
  tickActiveFocus,
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

describe('stopActiveFocus', () => {
  it('accumulates elapsed focus time', () => {
    const focused = startActiveFocus(session, 1_000);
    const stopped = stopActiveFocus(focused, 31_000);

    expect(stopped.activeFocusMs).toBe(30_000);
    expect(stopped.focusStartedAt).toBeNull();
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

describe('isCheckInDue', () => {
  it('uses accumulated active focus time', () => {
    const ready = {
      ...session,
      activeFocusMs: 30 * 60_000,
      checkInAfterActiveMs: 30 * 60_000,
    };

    expect(isCheckInDue(ready)).toBe(true);
    expect(getActiveFocusMs(ready)).toBe(30 * 60_000);
  });
});
