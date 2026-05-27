import { getCountries, getCountryCallingCode, getExampleNumber, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';
import worldCountries from 'world-countries';

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  dialCodes: string[];
  flag: string;
  format?: string;
  displayName?: string;
}

const PRIORITY_COUNTRIES = [
  'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'JP', 'CN', 'IN', 'BR', 'MX', 'KR', 'NL',
  'CH', 'SE', 'AE', 'SG', 'ZA', 'NG', 'SA', 'TR', 'ID', 'PH', 'TH', 'VN', 'MY', 'NZ', 'AR'
];

const supportedCountries = new Set(getCountries());
const worldCountryMap = new Map(worldCountries.map((country) => [country.cca2, country]));
const FALLBACK_COUNTRIES: Record<string, { name: string; dialCode?: string; flag?: string }> = {
  AC: { name: 'Ascension Island', dialCode: '+247' },
  TA: { name: 'Tristan da Cunha', dialCode: '+290' },
  BQ: { name: 'Caribbean Netherlands', dialCode: '+599' },
};

function normalizeDialCode(root: string, suffix: string) {
  const normalizedRoot = root.startsWith('+') ? root : `+${root}`;
  const digitsOnlySuffix = suffix.replace(/\D/g, '');
  return `${normalizedRoot}${digitsOnlySuffix}`;
}

function codeToFlag(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function buildDialCodes(country: (typeof worldCountries)[number] | undefined, fallbackDialCode: string) {
  const root = country?.idd?.root;
  if (!root) {
    return [fallbackDialCode];
  }

  const suffixes = country.idd?.suffixes?.length ? country.idd.suffixes : [''];
  const dialCodes = suffixes
    .map((suffix) => normalizeDialCode(root, suffix))
    .filter((dialCode) => /^\+\d+$/.test(dialCode));

  return Array.from(new Set([fallbackDialCode, ...(dialCodes.length ? dialCodes : [])]));
}

function getCountryFormat(code: CountryCode) {
  const example = getExampleNumber(code, examples);
  return example ? example.formatNational().replace(/\d/g, '#') : undefined;
}

function getCountryPriority(code: string) {
  const index = PRIORITY_COUNTRIES.indexOf(code);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

const generatedCountries = Array.from(supportedCountries)
  .map<Country>((code) => {
    const country = worldCountryMap.get(code);
    const fallback = FALLBACK_COUNTRIES[code];
    const dialCode = fallback?.dialCode ?? `+${getCountryCallingCode(code as CountryCode)}`;
    const dialCodes = buildDialCodes(country, dialCode);

    return {
      code,
      name: country?.name.common ?? fallback?.name ?? code,
      dialCode,
      dialCodes,
      flag: country?.flag || fallback?.flag || codeToFlag(code),
      format: getCountryFormat(code as CountryCode),
    } satisfies Country;
  })
  .sort((left, right) => {
    const priorityDelta = getCountryPriority(left.code) - getCountryPriority(right.code);
    return priorityDelta !== 0 ? priorityDelta : left.name.localeCompare(right.name);
  });

export const countries: Country[] = generatedCountries;

export const countryMap = new Map(countries.map((country) => [country.code, country]));

const countriesByDialCode = countries.reduce((map, country) => {
  for (const dialCode of country.dialCodes) {
    const matches = map.get(dialCode) ?? [];
    matches.push(country);
    map.set(dialCode, matches);
  }

  return map;
}, new Map<string, Country[]>());

const dialCodeMatchers = countries
  .flatMap((country) => country.dialCodes.map((dialCode) => ({ dialCode, country })))
  .sort((left, right) => right.dialCode.length - left.dialCode.length);

const displayNameCache = new Map<string, Intl.DisplayNames>();

function normalizeLocales(locale?: string | readonly string[]) {
  return Array.isArray(locale) ? [...locale] : locale ? [locale] : [];
}

function getDisplayNames(locale?: string | readonly string[]) {
  const locales = normalizeLocales(locale);
  if (locales.length === 0 || typeof Intl === 'undefined' || typeof Intl.DisplayNames === 'undefined') {
    return undefined;
  }

  const cacheKey = locales.join('|');
  const cached = displayNameCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const displayNames = new Intl.DisplayNames(locales, { type: 'region' });
    displayNameCache.set(cacheKey, displayNames);
    return displayNames;
  } catch {
    return undefined;
  }
}

function normalizeLookupDialCode(dialCode: string) {
  const digits = dialCode.replace(/\D/g, '');
  return digits ? `+${digits}` : '';
}

export function getCountryByCode(code: string): Country | undefined {
  return countryMap.get(code.toUpperCase());
}

export function getLocalizedCountryName(
  country: Country | undefined,
  locale?: string | readonly string[]
): string | undefined {
  if (!country) {
    return undefined;
  }

  const displayNames = getDisplayNames(locale);
  return displayNames?.of(country.code) ?? country.displayName ?? country.name;
}

export function localizeCountry(
  country: Country | undefined,
  locale?: string | readonly string[]
): Country | undefined {
  if (!country) {
    return undefined;
  }

  const displayName = getLocalizedCountryName(country, locale);
  return displayName ? { ...country, displayName } : country;
}

export function localizeCountries(
  list: Country[],
  locale?: string | readonly string[]
): Country[] {
  if (!locale) {
    return list;
  }

  return list.map((country) => localizeCountry(country, locale) ?? country);
}

export function getCountriesByDialCode(dialCode: string): Country[] {
  return countriesByDialCode.get(normalizeLookupDialCode(dialCode)) ?? [];
}

export function getCountryByDialCode(dialCode: string): Country | undefined {
  return getCountriesByDialCode(dialCode)[0];
}

export interface CountryOption {
  value: string;
  label: string;
  dialCode: string;
  flag: string;
}

export interface GetCountryOptionsParams {
  locale?: string | readonly string[];
  preferredCountries?: string[];
  excludeCountries?: string[];
  onlyCountries?: string[];
}

export function getCountryOptions(params: GetCountryOptionsParams = {}): CountryOption[] {
  let list = countries;

  if (params.onlyCountries?.length) {
    const allowed = new Set(params.onlyCountries.map((code) => code.toUpperCase()));
    list = list.filter((country) => allowed.has(country.code));
  }

  if (params.excludeCountries?.length) {
    const excluded = new Set(params.excludeCountries.map((code) => code.toUpperCase()));
    list = list.filter((country) => !excluded.has(country.code));
  }

  list = localizeCountries(list, params.locale);

  if (params.preferredCountries?.length) {
    const preferred = params.preferredCountries.map((code) => code.toUpperCase());
    list = [...list].sort((left, right) => {
      const leftIndex = preferred.indexOf(left.code);
      const rightIndex = preferred.indexOf(right.code);
      if (leftIndex !== -1 && rightIndex !== -1) {
        return leftIndex - rightIndex;
      }
      if (leftIndex !== -1) {
        return -1;
      }
      if (rightIndex !== -1) {
        return 1;
      }
      return (left.displayName ?? left.name).localeCompare(right.displayName ?? right.name);
    });
  }

  return list.map((country) => ({
    value: country.code,
    label: `${country.displayName ?? country.name} (${country.dialCode})`,
    dialCode: country.dialCode,
    flag: country.flag,
  }));
}

export function detectCountryFromPhone(phone: string): Country | undefined {
  const trimmed = phone.trim();

  if (!trimmed) {
    return undefined;
  }

  const normalized = trimmed.startsWith('+')
    ? `+${trimmed.replace(/\D/g, '')}`
    : trimmed.startsWith('00')
      ? `+${trimmed.slice(2).replace(/\D/g, '')}`
      : '';

  if (!normalized) {
    return undefined;
  }

  const parsedPhone = parsePhoneNumberFromString(normalized);
  if (parsedPhone?.country) {
    return getCountryByCode(parsedPhone.country);
  }

  return dialCodeMatchers.find((entry) => normalized.startsWith(entry.dialCode))?.country;
}
