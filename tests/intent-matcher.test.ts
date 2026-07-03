import { describe, expect, it } from 'vitest';
import {
  countRelatedTabs,
  extractKeywords,
  filterRelatedTabs,
  isTabRelatedToIntent,
} from '../utils/intent-matcher';

describe('extractKeywords', () => {
  it('removes filler words and deduplicates', () => {
    expect(extractKeywords('Looking for AWS pricing for AWS')).toEqual([
      'aws',
      'pricing',
    ]);
  });

  it('keeps meaningful short tokens', () => {
    expect(extractKeywords('Go fmt docs')).toEqual(['go', 'fmt', 'docs']);
  });

  it('returns empty list for vague intents', () => {
    expect(extractKeywords('just looking around')).toEqual([]);
  });
});

describe('isTabRelatedToIntent', () => {
  const keywords = ['aws', 'pricing'];

  it('matches when multiple keywords appear', () => {
    expect(
      isTabRelatedToIntent(
        {
          title: 'Amazon EC2 Pricing',
          url: 'https://aws.amazon.com/ec2/pricing/',
        },
        keywords,
      ),
    ).toBe(true);
  });

  it('matches single-keyword intents', () => {
    expect(
      isTabRelatedToIntent(
        {
          title: 'Kubernetes docs',
          url: 'https://kubernetes.io/docs',
        },
        ['kubernetes'],
      ),
    ).toBe(true);
  });

  it('rejects unrelated tabs', () => {
    expect(
      isTabRelatedToIntent(
        {
          title: 'Cat videos',
          url: 'https://example.com/cats',
        },
        keywords,
      ),
    ).toBe(false);
  });
});

describe('countRelatedTabs', () => {
  it('counts only related tabs', () => {
    const tabs = [
      { title: 'AWS EC2 pricing', url: 'https://aws.amazon.com/ec2/pricing/' },
      { title: 'AWS S3 pricing', url: 'https://aws.amazon.com/s3/pricing/' },
      { title: 'Random blog', url: 'https://example.com/blog' },
    ];

    expect(countRelatedTabs(tabs, ['aws', 'pricing'])).toBe(2);
    expect(filterRelatedTabs(tabs, ['aws', 'pricing'])).toHaveLength(2);
  });
});
