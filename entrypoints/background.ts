import { startActiveFocus, stopActiveFocus } from '../utils/active-time';
import { isTabRelatedToIntent } from '../utils/intent-matcher';
import {
  appendSessionHistory,
  applyCheckInResponse,
  buildPendingCheckIn,
  shouldSurfaceCheckIn,
  snoozeSession,
} from '../utils/session-manager';
import {
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

async function updateBadge(pending: boolean, relatedCount?: number): Promise<void> {
  if (pending) {
    await browser.action.setBadgeText({ text: '!' });
    await browser.action.setBadgeBackgroundColor({ color: '#0D9488' });
    await browser.action.setTitle({
      title: `Why Am I Here? — Check-in ready${relatedCount ? ` (${relatedCount} related tabs)` : ''}`,
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

async function evaluateCheckIn(session: IntentSession): Promise<void> {
  const settings = await getSettings();
  const pending = await getPendingCheckIn();
  if (pending) {
    return;
  }

  const updatedSession = await refreshSessionTabMatches(session);
  await saveActiveSession(updatedSession);

  const totalTabCount = updatedSession.trackedTabIds.length;
  const relatedTabCount = updatedSession.seenRelatedTabIds.length;

  if (
    !shouldSurfaceCheckIn({
      session: updatedSession,
      settings,
      totalTabCount,
      relatedTabCount,
    })
  ) {
    return;
  }

  const checkIn = buildPendingCheckIn(
    updatedSession,
    totalTabCount,
    relatedTabCount,
  );
  await savePendingCheckIn(checkIn);
  await updateBadge(true, relatedTabCount);
}

async function syncFocusForTab(
  session: IntentSession,
  tab: { active?: boolean; id?: number; title?: string; url?: string } | undefined,
): Promise<IntentSession> {
  const isRelated =
    !!tab?.id &&
    isTrackableUrl(tab.url) &&
    tabMatchesIntent(tab, session.keywords);

  if (isRelated) {
    return startActiveFocus(session);
  }

  return stopActiveFocus(session);
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
    await evaluateCheckIn(next);
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
  await updateBadge(false);
}

function sessionsEqual(a: IntentSession, b: IntentSession): boolean {
  return (
    a.id === b.id &&
    a.intent === b.intent &&
    a.status === b.status &&
    a.activeFocusMs === b.activeFocusMs &&
    a.focusStartedAt === b.focusStartedAt &&
    a.checkInAfterActiveMs === b.checkInAfterActiveMs &&
    arraysEqual(a.trackedTabIds, b.trackedTabIds) &&
    arraysEqual(a.relatedTabIds, b.relatedTabIds) &&
    arraysEqual(a.seenRelatedTabIds, b.seenRelatedTabIds)
  );
}

function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

async function respondToCheckIn(response: CheckInResponse): Promise<void> {
  const session = await getActiveSession();
  if (!session) {
    await savePendingCheckIn(null);
    await updateBadge(false);
    return;
  }

  const settings = await getSettings();
  let nextSession = stopActiveFocus(applyCheckInResponse(session, response));

  if (response === 'continue') {
    nextSession = snoozeSession(nextSession, settings);
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
      await updateBadge(true, pending.relatedTabCount);
    }
  });

  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') {
      return;
    }

    if (!('activeSession' in changes)) {
      return;
    }

    enqueueSessionTask(async () => {
      const change = changes.activeSession;
      if (!change?.newValue) {
        await clearTickAlarm();
        await updateBadge(false);
        return;
      }

      await syncStoredSession();
    });
  });

  browser.runtime.onInstalled.addListener(async () => {
    await migrateStorageIfNeeded();
    const { ensureStorageDefaults } = await import('../utils/app-state');
    await ensureStorageDefaults();
    const settings = await getSettings();
    await saveSettings(settings);
    await syncStoredSession();
  });

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== ALARM_NAMES.tick) {
      return;
    }

    enqueueSessionTask(async () => {
      await updateSession(
        async (session) => refreshSessionTabMatches(session),
        { evaluate: true },
      );
    });
  });

  browser.tabs.onActivated.addListener((activeInfo) => {
    enqueueSessionTask(async () => {
      await updateSession(async (session) => {
        const tab = await browser.tabs.get(activeInfo.tabId);
        let next = stopActiveFocus(session);
        next = await refreshSessionTabMatches(next);
        return syncFocusForTab(next, tab);
      });
    });
  });

  browser.windows.onFocusChanged.addListener((windowId) => {
    enqueueSessionTask(async () => {
      if (windowId === browser.windows.WINDOW_ID_NONE) {
        await updateSession(async (session) => stopActiveFocus(session));
        return;
      }

      await updateSession(async (session) => {
        const [activeTab] = await browser.tabs.query({
          active: true,
          windowId,
        });
        let next = stopActiveFocus(session);
        return syncFocusForTab(next, activeTab);
      });
    });
  });

  browser.tabs.onCreated.addListener(() => {
    enqueueSessionTask(async () => {
      await updateSession(async (session) => refreshSessionTabMatches(session));
    });
  });

  browser.tabs.onRemoved.addListener(() => {
    enqueueSessionTask(async () => {
      await updateSession(async (session) => refreshSessionTabMatches(session));
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
