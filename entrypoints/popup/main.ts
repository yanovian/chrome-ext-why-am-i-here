import './style.css';
import { loadAppState, saveAppSettings } from '../../utils/app-state';
import {
  formatCheckInHint,
  formatNudgeBody,
  formatNudgeTitle,
  getGoalStats,
} from '../../utils/goal-display';
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
const onGoalMinutes = document.querySelector<HTMLElement>('#on-goal-minutes')!;
const distractedMinutes = document.querySelector<HTMLElement>('#distracted-minutes')!;
const relatedCount = document.querySelector<HTMLElement>('#related-count')!;
const unrelatedCount = document.querySelector<HTMLElement>('#unrelated-count')!;
const activeHint = document.querySelector<HTMLElement>('#active-hint')!;
const endSessionBtn = document.querySelector<HTMLButtonElement>('#end-session-btn')!;

const goalFormLabel = document.querySelector<HTMLElement>('#goal-form-label')!;
const goalForm = document.querySelector<HTMLFormElement>('#goal-form')!;
const popupIntent = document.querySelector<HTMLInputElement>('#popup-intent')!;
const popupError = document.querySelector<HTMLElement>('#popup-error')!;
const popupStartBtn = document.querySelector<HTMLButtonElement>('#popup-start-btn')!;

const settingsToggle = document.querySelector<HTMLButtonElement>('#settings-toggle')!;
const settingsSection = document.querySelector<HTMLElement>('#settings-section')!;
const settingDistractionMinutes =
  document.querySelector<HTMLInputElement>('#setting-distraction-minutes')!;
const settingUnrelatedThreshold =
  document.querySelector<HTMLInputElement>('#setting-unrelated-threshold')!;
const settingRabbitMinutes =
  document.querySelector<HTMLInputElement>('#setting-rabbit-minutes')!;
const settingRabbitTabs =
  document.querySelector<HTMLInputElement>('#setting-rabbit-tabs')!;
const settingRabbitRelated =
  document.querySelector<HTMLInputElement>('#setting-rabbit-related')!;
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
  settingDistractionMinutes.value = String(settings.distractionMinutes);
  settingUnrelatedThreshold.value = String(settings.unrelatedTabThreshold);
  settingRabbitMinutes.value = String(settings.rabbitHoleMinutes);
  settingRabbitTabs.value = String(settings.rabbitHoleTabThreshold);
  settingRabbitRelated.value = String(settings.rabbitHoleMinRelatedTabs);
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

function renderCurrentGoal(
  session: IntentSession,
  settings = DEFAULT_SETTINGS,
) {
  const stats = getGoalStats(session);
  currentGoalSection.classList.remove('hidden');
  activeGoal.textContent = session.intent;
  onGoalMinutes.textContent = String(stats.onGoalMinutes);
  distractedMinutes.textContent = String(stats.distractedMinutes);
  relatedCount.textContent = String(stats.relatedTabs);
  unrelatedCount.textContent = String(stats.unrelatedTabs);
  activeHint.textContent = formatCheckInHint(session, settings);
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
    const pending = state.pendingCheckIn;
    checkinSection.classList.remove('hidden');
    checkinTitle.textContent = formatNudgeTitle(pending.type);
    checkinBody.textContent = formatNudgeBody(pending);
    continueBtn.textContent =
      pending.type === 'distraction' ? 'Back on track' : 'Keep going';
  } else {
    checkinSection.classList.add('hidden');
    continueBtn.textContent = 'Keep going';
  }

  if (state.activeSession) {
    const session = await loadLiveSession(state.activeSession);
    renderCurrentGoal(session, state.settings);
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
    renderCurrentGoal(await loadLiveSession(result.session), await getSettings());
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
        distractionMinutes: Number(settingDistractionMinutes.value),
        unrelatedTabThreshold: Number(settingUnrelatedThreshold.value),
        rabbitHoleMinutes: Number(settingRabbitMinutes.value),
        rabbitHoleTabThreshold: Number(settingRabbitTabs.value),
        rabbitHoleMinRelatedTabs: Number(settingRabbitRelated.value),
      });
      applySettingsToInputs(saved);
      void wakeBackgroundAndWait();
      await render();
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

  if ('activeSession' in changes || 'pendingCheckIn' in changes) {
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
