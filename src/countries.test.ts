import { describe, expect, it } from 'vitest';
import { getCountries } from 'libphonenumber-js';
import { countries, getCountryByCode } from './countries';

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
});
