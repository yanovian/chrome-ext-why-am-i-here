import './style.css';
import { loadAppState, saveAppSettings } from '../../utils/app-state';
import { formatCheckInHint, getGoalStats } from '../../utils/goal-display';
import { clearGoal, persistGoal, wakeBackgroundAndWait } from '../../utils/persist-goal';
import { getSettings } from '../../utils/storage';
import { refreshSessionFromOpenTabs } from '../../utils/tab-tracker';
import { respondToCheckIn } from '../../utils/runtime-client';
import { DEFAULT_SETTINGS, type IntentSession } from '../../utils/types';

const checkinSection = document.querySelector<HTMLElement>('#checkin-section')!;
const checkinTitle = document.querySelector<HTMLElement>('#checkin-title')!;
const checkinBody = document.querySelector<HTMLElement>('#checkin-body')!;
const completeBtn = document.querySelector<HTMLButtonElement>('#complete-btn')!;
const continueBtn = document.querySelector<HTMLButtonElement>('#continue-btn')!;
const dismissBtn = document.querySelector<HTMLButtonElement>('#dismiss-btn')!;

const currentGoalSection =
  document.querySelector<HTMLElement>('#current-goal-section')!;
const activeGoal = document.querySelector<HTMLElement>('#active-goal')!;
const activeMinutes = document.querySelector<HTMLElement>('#active-minutes')!;
const relatedCount = document.querySelector<HTMLElement>('#related-count')!;
const totalCount = document.querySelector<HTMLElement>('#total-count')!;
const activeHint = document.querySelector<HTMLElement>('#active-hint')!;
const endSessionBtn = document.querySelector<HTMLButtonElement>('#end-session-btn')!;

const goalFormLabel = document.querySelector<HTMLElement>('#goal-form-label')!;
const goalForm = document.querySelector<HTMLFormElement>('#goal-form')!;
const popupIntent = document.querySelector<HTMLInputElement>('#popup-intent')!;
const popupError = document.querySelector<HTMLElement>('#popup-error')!;
const popupStartBtn = document.querySelector<HTMLButtonElement>('#popup-start-btn')!;

const settingsToggle = document.querySelector<HTMLButtonElement>('#settings-toggle')!;
const settingsSection = document.querySelector<HTMLElement>('#settings-section')!;
const settingInterval = document.querySelector<HTMLInputElement>('#setting-interval')!;
const settingThreshold = document.querySelector<HTMLInputElement>('#setting-threshold')!;
const settingRelated = document.querySelector<HTMLInputElement>('#setting-related')!;
const saveSettingsBtn = document.querySelector<HTMLButtonElement>('#save-settings-btn')!;
const settingsStatus = document.querySelector<HTMLElement>('#settings-status')!;

let settingsOpen = false;
let renderInFlight: Promise<void> | null = null;
let renderQueued = false;
let lastRenderedSessionId: string | null = null;

function showPopupError(message: string) {
  popupError.textContent = message;
  popupError.classList.remove('hidden');
}

function clearPopupError() {
  popupError.textContent = '';
  popupError.classList.add('hidden');
}

function applySettingsToInputs(
  settings = DEFAULT_SETTINGS,
): void {
  settingInterval.value = String(settings.checkInIntervalMinutes);
  settingThreshold.value = String(settings.tabCountThreshold);
  settingRelated.value = String(settings.minRelatedTabs);
}

function setSettingsOpen(open: boolean) {
  settingsOpen = open;
  settingsSection.classList.toggle('hidden', !open);
  settingsToggle.classList.toggle('active', open);
}

function renderEmptyGoalForm() {
  currentGoalSection.classList.add('hidden');
  goalFormLabel.textContent = 'What are you looking for?';
  popupStartBtn.textContent = 'Set goal';
  lastRenderedSessionId = null;
}

function renderCurrentGoal(session: IntentSession) {
  const stats = getGoalStats(session);
  currentGoalSection.classList.remove('hidden');
  activeGoal.textContent = session.intent;
  activeMinutes.textContent = String(stats.activeMinutes);
  relatedCount.textContent = String(stats.relatedTabs);
  totalCount.textContent = String(stats.openTabs);
  activeHint.textContent = formatCheckInHint(session);
  goalFormLabel.textContent = 'Set a new goal';
  popupStartBtn.textContent = 'Replace goal';
  lastRenderedSessionId = session.id;
}

async function loadLiveSession(session: IntentSession): Promise<IntentSession> {
  try {
    return await refreshSessionFromOpenTabs(session);
  } catch {
    return session;
  }
}

async function renderGoalFromState(
  state: Awaited<ReturnType<typeof loadAppState>>,
) {
  if (state.pendingCheckIn) {
    checkinSection.classList.remove('hidden');
    checkinTitle.textContent = 'Time for a check-in';
    checkinBody.textContent = `You spent ${state.pendingCheckIn.activeMinutes} active minutes on “${state.pendingCheckIn.intent}” and opened ${state.pendingCheckIn.relatedTabCount} related tabs (${state.pendingCheckIn.totalTabCount} open). Goal completed?`;
  } else {
    checkinSection.classList.add('hidden');
  }

  if (state.activeSession) {
    const session = await loadLiveSession(state.activeSession);
    renderCurrentGoal(session);
    return;
  }

  renderEmptyGoalForm();
}

async function renderNow() {
  clearPopupError();

  const state = await loadAppState();
  void wakeBackgroundAndWait();
  await renderGoalFromState(state);
}

function render() {
  if (renderInFlight) {
    renderQueued = true;
    return renderInFlight;
  }

  renderInFlight = (async () => {
    try {
      await renderNow();
    } catch (error) {
      if (!lastRenderedSessionId) {
        renderEmptyGoalForm();
      }
      showPopupError(
        error instanceof Error ? error.message : 'Could not load extension state.',
      );
    } finally {
      renderInFlight = null;
      if (renderQueued) {
        renderQueued = false;
        void render();
      }
    }
  })();

  return renderInFlight;
}

async function handleSetGoal() {
  clearPopupError();
  const intent = popupIntent.value.trim();

  if (!intent) {
    showPopupError('Type a goal first (e.g. "AWS pricing").');
    popupIntent.focus();
    return;
  }

  popupStartBtn.disabled = true;

  try {
    const result = await persistGoal(intent);
    if (!result.ok) {
      showPopupError(result.error);
      return;
    }

    popupIntent.value = '';
    setSettingsOpen(false);
    renderCurrentGoal(await loadLiveSession(result.session));
  } catch (error) {
    showPopupError(
      error instanceof Error ? error.message : 'Could not reach the extension.',
    );
  } finally {
    popupStartBtn.disabled = false;
  }
}

goalForm.addEventListener('submit', (event) => {
  event.preventDefault();
  void handleSetGoal();
});

completeBtn.addEventListener('click', () => {
  void respondToCheckIn('completed').then(() => render());
});

continueBtn.addEventListener('click', () => {
  void respondToCheckIn('continue').then(() => render());
});

dismissBtn.addEventListener('click', () => {
  void respondToCheckIn('dismissed').then(() => render());
});

endSessionBtn.addEventListener('click', () => {
  void clearGoal().then(() => render());
});

settingsToggle.addEventListener('click', () => {
  const opening = !settingsOpen;
  setSettingsOpen(opening);
  if (opening) {
    void getSettings().then(applySettingsToInputs);
  }
});

saveSettingsBtn.addEventListener('click', () => {
  void (async () => {
    clearPopupError();
    saveSettingsBtn.disabled = true;

    try {
      const saved = await saveAppSettings({
        checkInIntervalMinutes: Number(settingInterval.value),
        tabCountThreshold: Number(settingThreshold.value),
        minRelatedTabs: Number(settingRelated.value),
      });
      applySettingsToInputs(saved);
      settingsStatus.classList.remove('hidden');
      setTimeout(() => settingsStatus.classList.add('hidden'), 1800);
    } catch (error) {
      showPopupError(
        error instanceof Error ? error.message : 'Could not save settings.',
      );
    } finally {
      saveSettingsBtn.disabled = false;
    }
  })();
});

let storageRenderTimer: ReturnType<typeof setTimeout> | undefined;

browser.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') {
    return;
  }

  if (
    'activeSession' in changes ||
    'pendingCheckIn' in changes
  ) {
    clearTimeout(storageRenderTimer);
    storageRenderTimer = setTimeout(() => {
      void render();
    }, 100);
  }
});

setInterval(() => {
  if (lastRenderedSessionId) {
    void render();
  }
}, 2_000);

void (async () => {
  applySettingsToInputs(await getSettings());
  await render();
})();
