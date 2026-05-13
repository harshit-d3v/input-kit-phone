# @input-kit/phone

Headless React phone input with a complete world country-code dataset, searchable country selection, and `libphonenumber-js` powered formatting and validation.

## Latest update

Version `0.1.3` tightens country coverage and compatibility:

- India is included as `IN` with `+91` and a localized phone placeholder.
- The country list now matches all `245` regions supported by `libphonenumber-js`.
- Fallback metadata is included for Ascension Island (`AC`), Tristan da Cunha (`TA`), and Caribbean Netherlands (`BQ`).
- Primary dial-code lookup now works for shared codes like `+1`, so `getCountriesByDialCode('+1')` returns matching regions.
- Older helper and hook aliases remain available for projects already using the previous API shape.

## Features

- **245 supported calling regions** derived from `libphonenumber-js` metadata and `world-countries`
- **Headless hook and component** via `usePhoneInput()` and `PhoneInput`
- **Searchable country selector** with country name, ISO code, and dial-code matching
- **Real formatting and validation** powered by `libphonenumber-js`
- **International detection** for pasted or typed `+` / `00` numbers
- **TypeScript-first** exports for countries, helpers, hook return values, and component refs

## Installation

```bash
npm install @input-kit/phone
```

## Quick Start

### Component

```tsx
import { PhoneInput } from '@input-kit/phone';

function Example() {
  return (
    <PhoneInput
      defaultCountry="US"
      onChange={(phone, country) => {
        console.log(phone, country?.code);
      }}
    />
  );
}
```

### Hook

```tsx
import { usePhoneInput } from '@input-kit/phone';

function Example() {
  const {
    inputProps,
    country,
    countryButtonProps,
    filteredCountries,
    selectCountry,
    isOpen,
    isValid,
  } = usePhoneInput({
    defaultCountry: 'US',
    onChange: (phone, nextCountry) => console.log(phone, nextCountry?.dialCode),
  });

  return (
    <div>
      <button {...countryButtonProps}>
        {country?.flag} {country?.dialCode}
      </button>

      {isOpen && (
        <div>
          {filteredCountries.map((candidate) => (
            <button key={candidate.code} onClick={() => selectCountry(candidate)}>
              {candidate.flag} {candidate.name} {candidate.dialCode}
            </button>
          ))}
        </div>
      )}

      <input {...inputProps} />
      {!isValid && <span>Invalid phone number</span>}
    </div>
  );
}
```

## Exports

### Components and hooks

- `PhoneInput`
- `usePhoneInput(options)`

### Country data

- `countries`
- `getCountryByCode(code)`
- `getCountryByDialCode(dialCode)`
- `getCountriesByDialCode(dialCode)`
- `detectCountryFromPhone(phone)`

### Utilities

- `cleanPhone(phone)`
- `formatPhone(phone, country)`
- `unformatPhone(formattedPhone)`
- `validatePhone(phone, country, validator?)`
- `validatePhoneLength(phone, country)`
- `addDialCode(phone, country)`
- `removeDialCode(phone, country)`
- `filterCountries(countries, query, preferredCountries?)`
- `getPlaceholder(country)`

Compatibility aliases are also exported for older consumers: `stripNonDigits`, `isInternationalFormat`, `detectCountry`, `formatPhoneNumber`, `parseToE164`, `getNationalNumber`, `validatePhoneNumber`, `isPhoneNumberComplete`, `formatAsYouType`, `normalizePhoneNumber`, `phoneNumbersEqual`, `getCountryDisplayLabel`, and `limitInputLength`.

## `usePhoneInput(options)`

| Option | Type | Default | Description |
|------|------|---------|-------------|
| `defaultCountry` | `string` | `'US'` | Default selected country |
| `preferredCountries` | `string[]` | - | Countries shown first in search results |
| `excludeCountries` | `string[]` | - | Countries to exclude |
| `onlyCountries` | `string[]` | - | Restrict selection to these countries |
| `autoDetect` | `boolean` | `true` | Detect country from international numbers |
| `formatOnType` | `boolean` | `true` | Apply live formatting |
| `includeDialCode` | `boolean` | `false` | Return values with dial code included |
| `validator` | `(phone, country) => boolean` | - | Custom validation override |

Important returned fields:

- `phone`
- `fullPhone`
- `country`
- `isValid`
- `isOpen`
- `searchQuery`
- `filteredCountries`
- `inputProps`
- `countryButtonProps`
- `setPhone()`
- `setCountry()`
- `selectCountry()`
- `openDropdown()`
- `closeDropdown()`
- `toggleDropdown()`
- `setSearchQuery()`
- `clear()`

## Notes

- Country coverage now comes from current `libphonenumber-js` supported regions instead of a short hand-maintained list, with fallback metadata for supported territories that are incomplete in `world-countries`.
- Formatting and validation behavior follows `libphonenumber-js`, similar to libraries like `react-phone-number-input`.
- The selector keeps a separate country button and number field, which matches the common multi-country pattern used by larger phone-input packages.

## License

MIT © Input Kit
