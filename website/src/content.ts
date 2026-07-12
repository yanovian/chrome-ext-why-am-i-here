import { GITHUB_URL } from '../site-meta';

export {
  CHROME_STORE_URL,
  GITHUB_URL,
  POUYAN_RAZIAN_NAME,
  POUYAN_RAZIAN_URL,
  SITE_NAME,
  SITE_URL,
  YANOVIAN_LLC_NAME,
  YANOVIAN_LLC_URL,
} from '../site-meta';

export const PRIVACY_PATH = 'privacy';

export const PRIVACY_REPO_URL = `${GITHUB_URL}/blob/master/PRIVACY.md`;

export const featureDefs = [
  { id: 'distraction', key: 'Distraction', icon: '↩' },
  { id: 'rabbit', key: 'Rabbit', icon: '🕳' },
  { id: 'goal', key: 'Goal', icon: '🎯' },
  { id: 'time', key: 'Time', icon: '⏱' },
  { id: 'tabs', key: 'Tabs', icon: '🗂' },
  { id: 'local', key: 'Local', icon: '🔒' },
] as const;

export const stepDefs = [
  { id: '1', key: '1' },
  { id: '2', key: '2' },
  { id: '3', key: '3' },
] as const;

export const privacyPointKeys = [
  'privacyPoint1',
  'privacyPoint2',
  'privacyPoint3',
  'privacyPoint4',
] as const;

export const reminderDefs = [
  { key: 'Distraction', tone: 'rose' },
  { key: 'Rabbit', tone: 'teal' },
  { key: 'Gentle', tone: 'mint' },
  { key: 'NoNotif', tone: 'slate' },
] as const;
