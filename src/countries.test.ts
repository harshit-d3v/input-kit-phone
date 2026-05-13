import { describe, expect, it } from 'vitest';
import { getCountries } from 'libphonenumber-js';
import { countries, getCountriesByDialCode, getCountryByCode } from './countries';

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
});
