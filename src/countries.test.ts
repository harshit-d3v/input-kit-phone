import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { getCountries } from 'libphonenumber-js';
import {
  countries,
  getCountriesByDialCode,
  getCountryByCode,
  getCountryOptions,
} from './countries';

/** SHA-256 of sorted ISO codes — update only when libphonenumber region set changes intentionally */
const COUNTRY_CODES_CHECKSUM_BASELINE =
  'f760bd6add5b111943f2983a4d5c50a1bf8d17f3e34cb347bdb06a2ac3ca21b7';

describe('countries', () => {
  it('matches libphonenumber-js supported calling region coverage', () => {
    expect(countries).toHaveLength(getCountries().length);
  });

  it('includes India with +91 metadata', () => {
    expect(getCountryByCode('IN')).toEqual(
      expect.objectContaining({
        code: 'IN',
        name: 'India',
        dialCode: '+91',
      })
    );
  });

  it('includes supported territories missing complete world-countries metadata', () => {
    expect(getCountryByCode('AC')).toEqual(
      expect.objectContaining({
        name: 'Ascension Island',
        dialCode: '+247',
      })
    );
    expect(getCountryByCode('TA')).toEqual(
      expect.objectContaining({
        name: 'Tristan da Cunha',
        dialCode: '+290',
      })
    );
    expect(getCountryByCode('BQ')).toEqual(
      expect.objectContaining({
        name: 'Caribbean Netherlands',
        dialCode: '+599',
      })
    );
  });

  it('includes each primary calling code in dial-code lookup results', () => {
    expect(getCountriesByDialCode('+1').map((country) => country.code)).toContain('US');
    expect(getCountriesByDialCode('+91').map((country) => country.code)).toContain('IN');
    expect(getCountriesByDialCode('+247').map((country) => country.code)).toContain('AC');
  });

  it('maps multiple regions to shared calling codes', () => {
    const plus44 = getCountriesByDialCode('+44').map((country) => country.code);
    expect(plus44).toEqual(expect.arrayContaining(['GB', 'GG', 'IM', 'JE']));

    const plus61 = getCountriesByDialCode('+61').map((country) => country.code);
    expect(plus61).toEqual(expect.arrayContaining(['AU', 'CC', 'CX']));

    const plus590 = getCountriesByDialCode('+590').map((country) => country.code);
    expect(plus590.length).toBeGreaterThan(1);
    expect(plus590).toEqual(expect.arrayContaining(['GP', 'BL', 'MF']));

    const plus262 = getCountriesByDialCode('+262').map((country) => country.code);
    expect(plus262.length).toBeGreaterThan(1);
    expect(plus262).toEqual(expect.arrayContaining(['RE', 'YT']));
  });

  it('keeps a stable checksum of supported country codes', () => {
    const checksum = createHash('sha256')
      .update(countries.map((country) => country.code).sort().join(','))
      .digest('hex');
    expect(checksum).toBe(COUNTRY_CODES_CHECKSUM_BASELINE);
  });

  it('builds sorted country options with filters', () => {
    const options = getCountryOptions({
      onlyCountries: ['US', 'GB', 'CA'],
      preferredCountries: ['GB', 'US'],
    });

    expect(options.map((option) => option.value)).toEqual(['GB', 'US', 'CA']);
    expect(options[0]).toEqual(
      expect.objectContaining({
        value: 'GB',
        dialCode: '+44',
        flag: '🇬🇧',
      })
    );
  });
});
