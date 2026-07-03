import {
  ensureSettingsExist,
  getActiveSession,
  getPendingCheckIn,
  getSettings,
  saveSettings,
} from './storage';
import { mergeSettings } from './session-manager';
import type { ExtensionSettings } from './types';

export async function ensureStorageDefaults(): Promise<void> {
  await ensureSettingsExist();
}

export async function saveAppSettings(
  partial: Partial<ExtensionSettings>,
): Promise<ExtensionSettings> {
  const next = mergeSettings({
    ...(await getSettings()),
    ...partial,
  });
  await saveSettings(next);

  const saved = await getSettings();
  if (JSON.stringify(saved) !== JSON.stringify(next)) {
    throw new Error('Settings failed to save. Reload the extension and try again.');
  }

  return saved;
}

export async function loadAppState() {
  const [activeSession, pendingCheckIn, settings] = await Promise.all([
    getActiveSession(),
    getPendingCheckIn(),
    getSettings(),
  ]);

  return {
    activeSession,
    pendingCheckIn,
    settings,
  };
}
