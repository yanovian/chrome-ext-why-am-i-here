import {
  getActiveSession,
  getPendingCheckIn,
  getSettings,
  saveSettings,
} from './storage';
import { mergeSettings } from './session-manager';

export async function ensureStorageDefaults(): Promise<void> {
  const settings = mergeSettings(await getSettings());
  await saveSettings(settings);
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
