import type { IntentSession } from './types';
import { stopActiveFocus } from './active-time';
import { extractKeywords } from './intent-matcher';
import {
  appendSessionHistory,
  createSession,
} from './session-manager';
import {
  getActiveSession,
  getSessionHistory,
  getSettings,
  saveActiveSession,
  savePendingCheckIn,
  saveSessionHistory,
} from './storage';
import { refreshSessionFromOpenTabs } from './tab-tracker';

export type PersistGoalResult =
  | { ok: true; session: IntentSession }
  | { ok: false; error: string };

/** Save a goal directly to storage (safe when the popup is about to close). */
export async function persistGoal(intent: string): Promise<PersistGoalResult> {
  const trimmed = intent.trim();

  if (!trimmed) {
    return { ok: false, error: 'Intent cannot be empty.' };
  }

  const settings = await getSettings();
  const keywords = extractKeywords(trimmed);

  if (keywords.length === 0) {
    return {
      ok: false,
      error: 'Add a more specific goal (e.g. "AWS pricing").',
    };
  }

  const existing = await getActiveSession();
  if (existing) {
    const history = await getSessionHistory();
    await saveSessionHistory(
      appendSessionHistory(history, {
        ...stopActiveFocus(existing),
        status: 'dismissed',
      }),
    );
  }

  // Save immediately so the goal survives popup close / dev reload.
  let session = createSession(trimmed, keywords, settings);
  await saveActiveSession(session);
  await savePendingCheckIn(null);

  try {
    session = await refreshSessionFromOpenTabs(session);
    await saveActiveSession(session);
  } catch {
    // Goal is already saved; tab stats will sync when background wakes.
  }

  const saved = await getActiveSession();
  if (!saved || saved.intent !== trimmed) {
    return { ok: false, error: 'Goal failed to save. Please try again.' };
  }

  wakeBackground();

  return { ok: true, session: saved };
}

/** Clear the active goal directly from storage. */
export async function clearGoal(): Promise<void> {
  const session = await getActiveSession();
  if (session) {
    const history = await getSessionHistory();
    await saveSessionHistory(
      appendSessionHistory(history, {
        ...stopActiveFocus(session),
        status: 'dismissed',
      }),
    );
  }

  await saveActiveSession(null);
  await savePendingCheckIn(null);
  wakeBackground();
}

function wakeBackground(): void {
  void browser.runtime.sendMessage({ type: 'syncSession' }).catch(() => {
    // Storage is already updated. Background will sync on next wake.
  });
}

export async function wakeBackgroundAndWait(): Promise<void> {
  try {
    await browser.runtime.sendMessage({ type: 'syncSession' });
  } catch {
    // Background may be asleep; storage already has the goal.
  }
}
