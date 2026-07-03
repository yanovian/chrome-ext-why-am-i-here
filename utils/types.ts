/** User-configurable extension settings (stored locally). */
export interface ExtensionSettings {
  /** Minutes on off-goal tabs before a distraction nudge. Default: 5 */
  distractionMinutes: number;
  /** Min unrelated tabs open (and leading related) for distraction nudge. Default: 2 */
  unrelatedTabThreshold: number;
  /** Minutes on related tabs before a rabbit-hole check-in. Default: 30 */
  rabbitHoleMinutes: number;
  /** Min open tabs before rabbit-hole check-in. Default: 40 */
  rabbitHoleTabThreshold: number;
  /** Min related tabs before rabbit-hole check-in. Default: 3 */
  rabbitHoleMinRelatedTabs: number;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  distractionMinutes: 5,
  unrelatedTabThreshold: 2,
  rabbitHoleMinutes: 30,
  rabbitHoleTabThreshold: 40,
  rabbitHoleMinRelatedTabs: 3,
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
  /** When the current on-goal focus stretch began */
  focusStartedAt: number | null;
  /** On-goal ms required before rabbit-hole check-in */
  checkInAfterActiveMs: number;
  /** Ms spent on unrelated trackable tabs while the window was focused */
  distractionMs: number;
  /** When the current off-goal stretch began */
  distractionStartedAt: number | null;
  /** Off-goal ms required before distraction nudge */
  nudgeAfterDistractionMs: number;
  /** All trackable tab IDs currently open */
  trackedTabIds: number[];
  /** Tab IDs that match the intent keywords */
  relatedTabIds: number[];
  /** Unique related tab IDs seen during this session */
  seenRelatedTabIds: number[];
  /** Unique unrelated tab IDs seen during this session */
  seenUnrelatedTabIds: number[];
}

export type CheckInResponse = 'completed' | 'continue' | 'dismissed';

export type FocusNudgeType = 'distraction' | 'rabbit-hole';

export interface PendingCheckIn {
  sessionId: string;
  intent: string;
  type: FocusNudgeType;
  relatedTabCount: number;
  unrelatedTabCount: number;
  totalTabCount: number;
  onGoalMinutes: number;
  distractionMinutes: number;
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
