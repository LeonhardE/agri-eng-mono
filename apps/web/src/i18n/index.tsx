import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import catalog from './messages.json';
import release from './release.json';
import type { Listing } from '../domain';

export type Locale = 'zh-CN' | 'ug-CN' | 'kk-Arab-CN';
export type MessageParams = Record<string, string | number>;
export const LANGUAGE_STORAGE_KEY = 'heji-language-v1';
export const languages = release.locales as {
  tag: Locale;
  name: string;
  direction: 'ltr' | 'rtl';
}[];
const columns = { 'zh-CN': 'zh', 'ug-CN': 'ug', 'kk-Arab-CN': 'kk' } as const;
const byId = new Map(catalog.messages.map((entry) => [entry.id, entry]));
const bySource = new Map(catalog.messages.map((entry) => [entry.zh, entry]));

export function parseLocale(value: string | null): Locale {
  return languages.some((language) => language.tag === value) ? (value as Locale) : 'zh-CN';
}

/** Production callers must opt out of draft content; the current app is explicitly a demo. */
export function translate(
  id: string,
  locale: Locale,
  params: MessageParams = {},
  allowDraft = release.allowDraftTranslations,
) {
  const entry = byId.get(id);
  if (!entry) return id;
  const column = columns[locale];
  const approved = column === 'zh' || entry.review[column].status === 'approved';
  const text = allowDraft || approved ? entry[column] || entry.zh : entry.zh;
  return text.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    Object.hasOwn(params, key) ? String(params[key]) : placeholder,
  );
}

export function translateSource(source: string, locale: Locale) {
  const entry = bySource.get(source);
  return entry ? translate(entry.id, locale) : source;
}

/** Only fictional, bundled seed content is translated. User-authored text stays verbatim. */
export function translateListing(listing: Listing, locale: Locale): Listing {
  if (locale === 'zh-CN' || !/^(tractor|harvester|drone|implement)-\d{2}$/.test(listing.id))
    return listing;
  const text = (source: string) => {
    const exact = bySource.get(source);
    if (exact) return translate(exact.id, locale);
    return source.replace(
      /农业无人飞机|收割机|旋耕机|播种机|拖拉机|马力|载重|幅宽|行播种/g,
      (term) => translateSource(term, locale),
    );
  };
  return {
    ...listing,
    title: text(listing.title),
    subtitle: text(listing.subtitle),
    description: text(listing.description),
    power: text(listing.power),
    ...(listing.tag ? { tag: text(listing.tag) } : {}),
    ...(listing.specs
      ? {
          specs: Object.fromEntries(
            Object.entries(listing.specs).map(([key, value]) => [text(key), text(value)]),
          ),
        }
      : {}),
  };
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (value: Locale) => void;
  storageError: boolean;
  t: (id: string, params?: MessageParams) => string;
  sourceText: (source: string) => string;
  localizeListing: (listing: Listing) => Listing;
};
const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      return parseLocale(localStorage.getItem(LANGUAGE_STORAGE_KEY));
    } catch {
      return 'zh-CN';
    }
  });
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'zh-CN' ? 'ltr' : 'rtl';
    document.title = `${locale === 'zh-CN' ? '禾集' : 'HEJI'} · ${translateSource('农机共享集市', locale)}`;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [locale]);
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      storageError,
      t: (id, params) => translate(id, locale, params, release.allowDraftTranslations),
      sourceText: (source) => translateSource(source, locale),
      localizeListing: (listing) => translateListing(listing, locale),
    }),
    [locale, storageError],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('I18nProvider is required');
  return value;
}
