import { describe, expect, it } from 'vitest';
import { extractKeywords } from '../utils/intent-matcher';
import { createSession } from '../utils/session-manager';

describe('persistGoal prerequisites', () => {
  it('accepts single-word goals like AWS', () => {
    expect(extractKeywords('AWS')).toEqual(['aws']);
  });

  it('creates an active session object', () => {
    const session = createSession(
      'AWS pricing',
      ['aws', 'pricing'],
      {
        checkInIntervalMinutes: 30,
        tabCountThreshold: 40,
        minRelatedTabs: 3,
      },
    );

    expect(session.status).toBe('active');
    expect(session.intent).toBe('AWS pricing');
    expect(session.keywords).toEqual(['aws', 'pricing']);
  });
});
