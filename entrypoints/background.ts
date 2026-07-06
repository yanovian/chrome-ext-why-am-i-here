import {
  startActiveFocus,
  stopActiveFocus,
  startDistraction,
  stopDistraction,
  tickActiveFocus,
  tickDistraction,
} from '../utils/active-time';
import { isTabRelatedToIntent } from '../utils/intent-matcher';
import {
  appendSessionHistory,
  applyCheckInResponse,
  buildPendingCheckIn,
  shouldSurfaceDistractionNudge,
  shouldSurfaceRabbitHoleNudge,
  snoozeSession,
} from '../utils/session-manager';
import {
  getUnrelatedTabIds,
  isTrackableUrl,
  refreshSessionFromOpenTabs,
} from '../utils/tab-tracker';
import { ALARM_NAMES } from '../utils/types';
import type { CheckInResponse, IntentSession } from '../utils/types';
import {
  getActiveSession,
  getPendingCheckIn,
  getSessionHistory,
  getSettings,
  migrateStorageIfNeeded,
  saveActiveSession,
  savePendingCheckIn,
  saveSessionHistory,
  saveSettings,
} from '../utils/storage';

let sessionQueue = Promise.resolve();

function enqueueSessionTask(task: () => Promise<void>): void {
  sessionQueue = sessionQueue.then(task).catch((error) => {
    console.error('[Why Am I Here?]', error);
  });
}

function tabMatchesIntent(
  tab: { title?: string; url?: string },
  keywords: string[],
): boolean {
  return isTabRelatedToIntent(
    { title: tab.title ?? '', url: tab.url ?? '' },
    keywords,
  );
}

async function scheduleTickAlarm(): Promise<void> {
  await browser.alarms.clear(ALARM_NAMES.tick);
  await browser.alarms.create(ALARM_NAMES.tick, { periodInMinutes: 1 });
}

async function clearTickAlarm(): Promise<void> {
  await browser.alarms.clear(ALARM_NAMES.tick);
}

async function updateBadge(pending: boolean, label?: string): Promise<void> {
  if (pending) {
    await browser.action.setBadgeText({ text: '!' });
    await browser.action.setBadgeBackgroundColor({ color: '#0D9488' });
    await browser.action.setTitle({
      title: label ?? 'Why Am I Here? — Nudge ready',
    });
    return;
  }

  await browser.action.setBadgeText({ text: '' });
  await browser.action.setTitle({ title: 'Why Am I Here?' });
}

async function refreshSessionTabMatches(
  session: IntentSession,
): Promise<IntentSession> {
  return refreshSessionFromOpenTabs(session);
}

async function evaluateNudges(session: IntentSession): Promise<void> {
  const settings = await getSettings();
  const pending = await getPendingCheckIn();
  if (pending) {
    return;
  }

  const updatedSession = await refreshSessionTabMatches(session);
  await saveActiveSession(updatedSession);

  const unrelatedOpen = getUnrelatedTabIds(updatedSession).length;
  const relatedOpen = updatedSession.relatedTabIds.length;
  const relatedSeen = updatedSession.seenRelatedTabIds.length;

  if (
    shouldSurfaceDistractionNudge({
      session: updatedSession,
      settings,
      unrelatedOpenCount: unrelatedOpen,
      relatedOpenCount: relatedOpen,
    })
  ) {
    const checkIn = buildPendingCheckIn(
      updatedSession,
      'distraction',
      unrelatedOpen,
      updatedSession.trackedTabIds.length,
      relatedOpen,
    );
    await savePendingCheckIn(checkIn);
    await updateBadge(true, 'Why Am I Here? — Refocus nudge');
    return;
  }

  if (
    shouldSurfaceRabbitHoleNudge({
      session: updatedSession,
      settings,
      totalTabCount: updatedSession.trackedTabIds.length,
      relatedTabCount: relatedSeen,
    })
  ) {
    const checkIn = buildPendingCheckIn(
      updatedSession,
      'rabbit-hole',
      unrelatedOpen,
      updatedSession.trackedTabIds.length,
      relatedSeen,
    );
    await savePendingCheckIn(checkIn);
    await updateBadge(true, 'Why Am I Here? — Rabbit-hole check-in');
  }
}

async function syncFocusForTab(
  session: IntentSession,
  tab: { active?: boolean; id?: number; title?: string; url?: string } | undefined,
): Promise<IntentSession> {
  if (!tab?.id || !isTrackableUrl(tab.url)) {
    return stopDistraction(stopActiveFocus(session));
  }

  if (tabMatchesIntent(tab, session.keywords)) {
    return startActiveFocus(stopDistraction(session));
  }

  return startDistraction(stopActiveFocus(session));
}

async function syncFocusFromActiveTab(
  session: IntentSession,
): Promise<IntentSession> {
  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return syncFocusForTab(session, activeTab);
}

async function updateSession(
  updater: (session: IntentSession) => Promise<IntentSession>,
  options: { evaluate?: boolean } = {},
): Promise<void> {
  const session = await getActiveSession();
  if (!session || session.status !== 'active') {
    return;
  }

  const next = await updater(session);
  await saveActiveSession(next);

  if (options.evaluate) {
    await evaluateNudges(next);
  }
}

async function syncStoredSession(): Promise<void> {
  const session = await getActiveSession();
  if (!session) {
    await clearTickAlarm();
    await updateBadge(false);
    return;
  }

  let next = await refreshSessionTabMatches(session);
  next = await syncFocusFromActiveTab(next);

  if (!sessionsEqual(session, next)) {
    await saveActiveSession(next);
  }

  await scheduleTickAlarm();

  const pendingBefore = await getPendingCheckIn();
  if (!pendingBefore) {
    await evaluateNudges(next);
  }

  const pending = await getPendingCheckIn();
  if (pending) {
    const label =
      pending.type === 'distraction'
        ? 'Why Am I Here? — Refocus nudge'
        : 'Why Am I Here? — Rabbit-hole check-in';
    await updateBadge(true, label);
  } else {
    await updateBadge(false);
  }
}

function sessionsEqual(a: IntentSession, b: IntentSession): boolean {
  return (
    a.id === b.id &&
    a.intent === b.intent &&
    a.status === b.status &&
    a.activeFocusMs === b.activeFocusMs &&
    a.focusStartedAt === b.focusStartedAt &&
    a.checkInAfterActiveMs === b.checkInAfterActiveMs &&
    a.distractionMs === b.distractionMs &&
    a.distractionStartedAt === b.distractionStartedAt &&
    a.nudgeAfterDistractionMs === b.nudgeAfterDistractionMs &&
    arraysEqual(a.trackedTabIds, b.trackedTabIds) &&
    arraysEqual(a.relatedTabIds, b.relatedTabIds) &&
    arraysEqual(a.seenRelatedTabIds, b.seenRelatedTabIds) &&
    arraysEqual(a.seenUnrelatedTabIds, b.seenUnrelatedTabIds)
  );
}

function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

async function respondToCheckIn(response: CheckInResponse): Promise<void> {
  const pending = await getPendingCheckIn();
  const session = await getActiveSession();
  if (!session) {
    await savePendingCheckIn(null);
    await updateBadge(false);
    return;
  }

  const settings = await getSettings();
  let nextSession = applyCheckInResponse(session, response);

  if (response === 'continue') {
    nextSession = snoozeSession(
      nextSession,
      settings,
      pending?.type ?? 'rabbit-hole',
    );
    await saveActiveSession(nextSession);
    await savePendingCheckIn(null);
    await updateBadge(false);
    return;
  }

  const history = await getSessionHistory();
  await saveSessionHistory(appendSessionHistory(history, nextSession));
  await saveActiveSession(null);
  await savePendingCheckIn(null);
  await clearTickAlarm();
  await updateBadge(false);
}

export default defineBackground(() => {
  void migrateStorageIfNeeded().then(async () => {
    const { ensureStorageDefaults } = await import('../utils/app-state');
    await ensureStorageDefaults();
    await syncStoredSession();

    const pending = await getPendingCheckIn();
    if (pending) {
      const label =
        pending.type === 'distraction'
          ? 'Why Am I Here? — Refocus nudge'
          : 'Why Am I Here? — Rabbit-hole check-in';
      await updateBadge(true, label);
    }
  });

  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') {
      return;
    }

    if (!('activeSession' in changes) && !('pendingCheckIn' in changes)) {
      return;
    }

    enqueueSessionTask(async () => {
      if ('activeSession' in changes && !changes.activeSession?.newValue) {
        await clearTickAlarm();
        await updateBadge(false);
        return;
      }

      if ('activeSession' in changes && changes.activeSession?.newValue) {
        await syncStoredSession();
        return;
      }

      if ('pendingCheckIn' in changes && !changes.pendingCheckIn?.newValue) {
        const session = await getActiveSession();
        if (!session) {
          await clearTickAlarm();
          await updateBadge(false);
        }
      }
    });
  });

  browser.runtime.onInstalled.addListener(async () => {
    await migrateStorageIfNeeded();
    const { ensureStorageDefaults } = await import('../utils/app-state');
    await ensureStorageDefaults();
    await syncStoredSession();
  });

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== ALARM_NAMES.tick) {
      return;
    }

    enqueueSessionTask(async () => {
      await updateSession(
        async (session) => {
          let next = await refreshSessionTabMatches(session);
          if (next.focusStartedAt !== null) {
            next = tickActiveFocus(next);
          }
          if (next.distractionStartedAt !== null) {
            next = tickDistraction(next);
          }
          return next;
        },
        { evaluate: true },
      );
    });
  });

  browser.tabs.onActivated.addListener((activeInfo) => {
    enqueueSessionTask(async () => {
      await updateSession(async (session) => {
        const tab = await browser.tabs.get(activeInfo.tabId);
        let next = stopDistraction(stopActiveFocus(session));
        next = await refreshSessionTabMatches(next);
        return syncFocusForTab(next, tab);
      }, { evaluate: true });
    });
  });

  browser.windows.onFocusChanged.addListener((windowId) => {
    enqueueSessionTask(async () => {
      if (windowId === browser.windows.WINDOW_ID_NONE) {
        await updateSession(async (session) =>
          stopDistraction(stopActiveFocus(session)),
        );
        return;
      }

      await updateSession(async (session) => {
        const [activeTab] = await browser.tabs.query({
          active: true,
          windowId,
        });
        let next = stopDistraction(stopActiveFocus(session));
        return syncFocusForTab(next, activeTab);
      }, { evaluate: true });
    });
  });

  browser.tabs.onCreated.addListener(() => {
    enqueueSessionTask(async () => {
      await updateSession(async (session) => refreshSessionTabMatches(session), {
        evaluate: true,
      });
    });
  });

  browser.tabs.onRemoved.addListener(() => {
    enqueueSessionTask(async () => {
      await updateSession(async (session) => refreshSessionTabMatches(session), {
        evaluate: true,
      });
    });
  });

  browser.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete' && !changeInfo.title && !changeInfo.url) {
      return;
    }

    enqueueSessionTask(async () => {
      await updateSession(async (session) => {
        let next = await refreshSessionTabMatches(session);

        if (tab.active && tab.windowId !== undefined) {
          const focusedWindows = await browser.windows.getAll({
            windowTypes: ['normal'],
          });
          const focusedWindow = focusedWindows.find((window) => window.focused);

          if (focusedWindow?.id === tab.windowId) {
            next = await syncFocusForTab(next, tab);
          }
        }

        return next;
      }, { evaluate: true });
    });
  });

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    void (async () => {
      try {
        switch (message?.type) {
          case 'syncSession':
            await syncStoredSession();
            sendResponse({ ok: true });
            return;
          case 'respondToCheckIn':
            await respondToCheckIn(message.response as CheckInResponse);
            sendResponse({ ok: true });
            return;
          case 'updateSettings': {
            const current = await getSettings();
            const next = { ...current, ...message.settings };
            await saveSettings(next);
            sendResponse({ ok: true });
            return;
          }
          default:
            sendResponse({ ok: false, error: 'Unknown message type' });
        }
      } catch (error) {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : 'Unexpected error',
        });
      }
    })();

    return true;
  });
});
