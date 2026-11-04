import { describe, expect, it } from 'vitest';
import { parseLocale, translate, translateListing } from './i18n';
import catalog from './i18n/messages.json';
import glossary from './i18n/glossary.json';
import release from './i18n/release.json';
import { seedListings } from './domain';

function placeholders(text: string) {
  return [...new Set(text.match(/\{\w+\}/g) ?? [])].sort();
}

describe('language configuration and review boundaries', () => {
  it('recovers unsupported browser preferences and distinguishes Arabic-script Kazakh', () => {
    for (const invalid of [null, '', 'en', 'kk-Cyrl-KZ', 'ar', '{broken']) {
      expect(parseLocale(invalid)).toBe('zh-CN');
    }
    expect(parseLocale('ug-CN')).toBe('ug-CN');
    expect(parseLocale('kk-Arab-CN')).toBe('kk-Arab-CN');
    expect(release.locales.find(({ tag }) => tag === 'kk-Arab-CN')?.direction).toBe('rtl');
  });

  it('provides unique message identities and matching interpolation tokens in all three languages', () => {
    expect(new Set(catalog.messages.map(({ id }) => id)).size).toBe(catalog.messages.length);
    for (const entry of catalog.messages) {
      expect(entry.zh.trim(), entry.id).not.toBe('');
      for (const language of ['ug', 'kk'] as const) {
        expect(entry[language].trim(), `${entry.id} ${language}`).not.toBe('');
        expect(placeholders(entry[language]), `${entry.id} ${language}`).toEqual(
          placeholders(entry.zh),
        );
      }
    }
  });

  it('never presents a draft as approved when draft use is disabled', () => {
    const draft = catalog.messages.find((entry) => entry.review.ug.status === 'draft')!;
    expect(draft).toBeDefined();
    expect(translate(draft.id, 'ug-CN', {}, false)).toBe(draft.zh);
    expect(translate(draft.id, 'ug-CN', {}, true)).toBe(draft.ug);
    expect(release.channel).toBe('demo');
    expect(release.productionApproved).toBe(false);
  });

  it('interpolates values without treating user-provided braces as another translation token', () => {
    const entry = catalog.messages.find((item) => item.zh.includes('{title}'))!;
    const title = 'LX904 {price}';
    expect(translate(entry.id, 'ug-CN', { title })).toContain(title);
  });

  it('links each agricultural term to an actual message and leaves specialist sign-off unclaimed', () => {
    const messages = new Map(catalog.messages.map((entry) => [entry.id, entry]));
    for (const term of glossary.terms) {
      expect(messages.get(term.messageId)?.zh, term.id).toBe(term.source);
      expect(term.meaning.trim()).not.toBe('');
      if (term.reviewStatus === 'draft') {
        expect(term.approvedAt).toBeNull();
      }
    }
  });

  it('keeps original submissions unchanged while preserving quote values in translated demo fixtures', () => {
    const original = { ...seedListings[0]!, id: 'local-original', title: 'LX904 تىراكتور' };
    expect(translateListing(original, 'kk-Arab-CN')).toBe(original);
    const translated = translateListing(seedListings[0]!, 'ug-CN');
    expect(translated.title).toContain('6B-1204');
    expect(translated.price).toBe(seedListings[0]!.price);
    expect(translated.power).toContain('120');
    expect(translated.location).toBe(seedListings[0]!.location);
  });
});
