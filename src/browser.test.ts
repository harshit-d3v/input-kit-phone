import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectBrowserCountry } from './browser';

describe('detectBrowserCountry', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns fallback on SSR when window is undefined', () => {
    vi.stubGlobal('window', undefined);
    expect(detectBrowserCountry('gb')).toBe('GB');
    expect(detectBrowserCountry()).toBeUndefined();
  });

  it('resolves primary and legacy IANA timezones before navigator locales', () => {
    const originalDateTimeFormat = Intl.DateTimeFormat;
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation((...args) => {
      const instance = new originalDateTimeFormat(...args);
      return {
        ...instance,
        resolvedOptions: () => ({ ...instance.resolvedOptions(), timeZone: 'Asia/Calcutta' }),
      };
    });

    expect(detectBrowserCountry('US')).toBe('IN');
  });

  it('falls back to navigator.languages and skips UN M.49 numeric regions', () => {
    const originalDateTimeFormat = Intl.DateTimeFormat;
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation((...args) => {
      const instance = new originalDateTimeFormat(...args);
      return {
        ...instance,
        resolvedOptions: () => ({ ...instance.resolvedOptions(), timeZone: 'UTC' }),
      };
    });

    vi.stubGlobal('navigator', {
      language: 'es-419',
      languages: ['es-419', 'zh-Hans', 'pt-BR'],
    });

    expect(detectBrowserCountry('US')).toBe('BR');
  });

  it('returns fallback when neither timezone nor locale resolves a region', () => {
    const originalDateTimeFormat = Intl.DateTimeFormat;
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation((...args) => {
      const instance = new originalDateTimeFormat(...args);
      return {
        ...instance,
        resolvedOptions: () => ({ ...instance.resolvedOptions(), timeZone: 'Etc/UTC' }),
      };
    });

    vi.stubGlobal('navigator', {
      language: 'en',
      languages: ['en', 'fr'],
    });

    expect(detectBrowserCountry('de')).toBe('DE');
    expect(detectBrowserCountry()).toBeUndefined();
  });
});
