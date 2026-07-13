import { GITHUB_URL } from './site-meta.ts';

export const SUB_PAGES = {
  privacy: { mdFile: 'PRIVACY.md', navKey: 'privacyNav' },
} as const;

export type SubPageId = keyof typeof SUB_PAGES;
export type SitePage = '' | SubPageId;
export const SUB_PAGE_IDS = Object.keys(SUB_PAGES) as SubPageId[];
export const PRERENDER_PAGES = ['', ...SUB_PAGE_IDS] as const satisfies readonly SitePage[];

export function subPageRepoUrl(page: SubPageId): string {
  return `${GITHUB_URL}/blob/master/${SUB_PAGES[page].mdFile}`;
}

export function isSubPageId(value: string): value is SubPageId {
  return value in SUB_PAGES;
}

export function isSitePage(value: string): value is SitePage {
  return value === '' || isSubPageId(value);
}
