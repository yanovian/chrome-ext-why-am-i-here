import { describe, expect, it } from 'vitest';
import { createSession } from '../utils/session-manager';
import { DEFAULT_SETTINGS } from '../utils/types';
import { applyTabSnapshot } from '../utils/tab-tracker';

describe('applyTabSnapshot', () => {
  it('counts related and open tabs from live tab data', () => {
    const session = createSession('aws', ['aws'], DEFAULT_SETTINGS);

    const updated = applyTabSnapshot(session, [
      { id: 1, title: 'aws - Google Search', url: 'https://www.google.com/search?q=aws' },
      { id: 2, title: 'Inbox', url: 'https://mail.google.com' },
      { id: 3, title: 'New Tab', url: 'chrome://newtab/' },
    ]);

    expect(updated.trackedTabIds).toEqual([1, 2]);
    expect(updated.relatedTabIds).toEqual([1]);
    expect(updated.seenRelatedTabIds).toEqual([1]);
    expect(updated.seenUnrelatedTabIds).toEqual([2]);
  });
});
