const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'for',
  'to',
  'of',
  'in',
  'on',
  'at',
  'is',
  'it',
  'and',
  'or',
  'my',
  'i',
  'im',
  "i'm",
  'am',
  'looking',
  'find',
  'finding',
  'search',
  'searching',
  'need',
  'about',
  'around',
  'just',
  'some',
  'get',
  'check',
  'see',
  'read',
  'learn',
  'research',
  'researching',
]);

/** Extract meaningful keywords from free-form intent text. */
export function extractKeywords(intent: string): string[] {
  const normalized = intent
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word));

  return [...new Set(normalized)];
}

export interface TabMatchInput {
  title: string;
  url: string;
}

/** Returns true when a tab title or URL appears related to session keywords. */
export function isTabRelatedToIntent(
  tab: TabMatchInput,
  keywords: string[],
): boolean {
  if (keywords.length === 0) {
    return false;
  }

  const haystack = `${tab.title} ${tab.url}`.toLowerCase();
  const matched = keywords.filter((keyword) => haystack.includes(keyword));
  return matched.length >= Math.min(2, keywords.length);
}

/** Count how many tabs in a list match the intent keywords. */
export function countRelatedTabs(
  tabs: TabMatchInput[],
  keywords: string[],
): number {
  return tabs.filter((tab) => isTabRelatedToIntent(tab, keywords)).length;
}

/** Filter tabs that match intent keywords. */
export function filterRelatedTabs<T extends TabMatchInput>(
  tabs: T[],
  keywords: string[],
): T[] {
  return tabs.filter((tab) => isTabRelatedToIntent(tab, keywords));
}
