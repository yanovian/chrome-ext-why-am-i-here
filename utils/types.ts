/** User-configurable extension settings (stored locally). */
export interface ExtensionSettings {
  /** Active minutes on related tabs before a check-in. Default: 30 */
  checkInIntervalMinutes: number;
  /** Minimum open tab count before surfacing a check-in. Default: 40 */
  tabCountThreshold: number;
  /** Minimum related tabs required to show a check-in. Default: 3 */
  minRelatedTabs: number;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  checkInIntervalMinutes: 30,
  tabCountThreshold: 40,
  minRelatedTabs: 3,
};

export type SessionStatus = 'active' | 'completed' | 'dismissed';

/** A browsing intent session started from the popup. */
export interface IntentSession {
  id: string;
  intent: string;
  keywords: string[];
  startedAt: number;
  status: SessionStatus;
  /** Ms spent on related tabs while the window was focused */
  activeFocusMs: number;
  /** When the current focused stretch on a related tab began */
  focusStartedAt: number | null;
  /** Active focus ms required before check-in becomes eligible */
  checkInAfterActiveMs: number;
  /** All trackable tab IDs currently open */
  trackedTabIds: number[];
  /** Tab IDs that match the intent keywords */
  relatedTabIds: number[];
  /** Unique related tab IDs seen during this session */
  seenRelatedTabIds: number[];
}

export type CheckInResponse = 'completed' | 'continue' | 'dismissed';

export interface PendingCheckIn {
  sessionId: string;
  intent: string;
  relatedTabCount: number;
  totalTabCount: number;
  activeMinutes: number;
  createdAt: number;
}

export interface StorageSchema {
  settings: ExtensionSettings;
  activeSession: IntentSession | null;
  pendingCheckIn: PendingCheckIn | null;
  sessionHistory: IntentSession[];
}

export const STORAGE_KEYS = {
  settings: 'settings',
  activeSession: 'activeSession',
  pendingCheckIn: 'pendingCheckIn',
  sessionHistory: 'sessionHistory',
} as const;

/** Legacy keys from an earlier build — migrated on startup. */
export const LEGACY_STORAGE_KEYS = {
  settings: 'local:settings',
  activeSession: 'local:activeSession',
  pendingCheckIn: 'local:pendingCheckIn',
  sessionHistory: 'local:sessionHistory',
} as const;

export const ALARM_NAMES = {
  tick: 'why-am-i-here:tick',
} as const;
