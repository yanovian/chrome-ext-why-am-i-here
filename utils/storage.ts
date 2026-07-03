import type {
  ExtensionSettings,
  IntentSession,
  PendingCheckIn,
} from './types';
import { DEFAULT_SETTINGS } from './types';
import { extractKeywords } from './intent-matcher';
import { mergeSettings, normalizeSession } from './session-manager';

const KEYS = {
  settings: 'settings',
  activeSession: 'activeSession',
  pendingCheckIn: 'pendingCheckIn',
  sessionHistory: 'sessionHistory',
} as const;

/** @deprecated Use KEYS — kept for background listener compatibility */
export const STORAGE_KEYS = KEYS;

const LEGACY_KEYS = [
  'local:settings',
  'local:activeSession',
  'local:pendingCheckIn',
  'local:sessionHistory',
] as const;

let migrationDone = false;

async function readLocal<T>(key: string): Promise<T | undefined> {
  const result = await browser.storage.local.get([key]);
  return result[key] as T | undefined;
}

async function writeLocal(key: string, value: unknown): Promise<void> {
  if (value === null || value === undefined) {
    await browser.storage.local.remove(key);
    return;
  }

  await browser.storage.local.set({ [key]: value });
}

export async function migrateLegacyStorageIfNeeded(): Promise<void> {
  if (migrationDone) {
    return;
  }

  const stored = await browser.storage.local.get([
    ...LEGACY_KEYS,
    KEYS.settings,
    KEYS.activeSession,
    KEYS.pendingCheckIn,
    KEYS.sessionHistory,
  ]);
  const writes: Record<string, unknown> = {};
  const toRemove: string[] = [];

  // Only copy legacy values when the new key is missing — never clobber a live goal.
  if (!stored[KEYS.settings] && stored['local:settings']) {
    writes[KEYS.settings] = mergeSettings(
      stored['local:settings'] as Partial<ExtensionSettings>,
    );
  }
  if (!stored[KEYS.activeSession] && stored['local:activeSession']) {
    writes[KEYS.activeSession] = normalizeSession(
      stored['local:activeSession'] as IntentSession,
    );
  }
  if (!stored[KEYS.pendingCheckIn] && stored['local:pendingCheckIn']) {
    writes[KEYS.pendingCheckIn] = stored['local:pendingCheckIn'];
  }
  if (!stored[KEYS.sessionHistory] && stored['local:sessionHistory']) {
    writes[KEYS.sessionHistory] = (
      stored['local:sessionHistory'] as IntentSession[]
    ).map((entry) => normalizeSession(entry));
  }

  for (const key of LEGACY_KEYS) {
    if (stored[key] !== undefined) {
      toRemove.push(key);
    }
  }

  if (Object.keys(writes).length > 0) {
    await browser.storage.local.set(writes);
  }
  if (toRemove.length > 0) {
    await browser.storage.local.remove(toRemove);
  }

  migrationDone = true;
}

function normalizeActiveSession(
  session: IntentSession | null | undefined,
): IntentSession | null {
  if (!session) {
    return null;
  }

  const normalized = normalizeSession(session);

  if (!normalized.intent?.trim()) {
    return null;
  }

  if (!normalized.keywords.length) {
    normalized.keywords = extractKeywords(normalized.intent);
  }

  // Anything stored under activeSession is the live goal, even if an older
  // build left a terminal status on the record during migration.
  normalized.status = 'active';

  return normalized;
}

export async function getSettings(): Promise<ExtensionSettings> {
  await migrateLegacyStorageIfNeeded();
  return mergeSettings(await readLocal<Partial<ExtensionSettings>>(KEYS.settings));
}

export async function saveSettings(
  settings: ExtensionSettings,
): Promise<void> {
  await writeLocal(KEYS.settings, settings);
}

export async function getActiveSession(): Promise<IntentSession | null> {
  await migrateLegacyStorageIfNeeded();
  const raw = await readLocal<IntentSession | { value?: IntentSession }>(
    KEYS.activeSession,
  );

  if (!raw) {
    return null;
  }

  const session =
    typeof raw === 'object' && raw !== null && 'value' in raw && raw.value
      ? raw.value
      : (raw as IntentSession);

  return normalizeActiveSession(session);
}

export async function saveActiveSession(
  session: IntentSession | null,
): Promise<void> {
  await writeLocal(KEYS.activeSession, session);
}

export async function getPendingCheckIn(): Promise<PendingCheckIn | null> {
  await migrateLegacyStorageIfNeeded();
  return (await readLocal<PendingCheckIn>(KEYS.pendingCheckIn)) ?? null;
}

export async function savePendingCheckIn(
  checkIn: PendingCheckIn | null,
): Promise<void> {
  await writeLocal(KEYS.pendingCheckIn, checkIn);
}

export async function getSessionHistory(): Promise<IntentSession[]> {
  await migrateLegacyStorageIfNeeded();
  const history = await readLocal<IntentSession[]>(KEYS.sessionHistory);
  return (history ?? []).map((entry) => normalizeSession(entry));
}

export async function saveSessionHistory(
  history: IntentSession[],
): Promise<void> {
  await writeLocal(KEYS.sessionHistory, history);
}

export const migrateStorageIfNeeded = migrateLegacyStorageIfNeeded;
