# @input-kit/phone

Headless React phone input with a complete world country-code dataset, searchable country selection, and `libphonenumber-js` powered formatting and validation.

## Latest update

Version **0.2.0** adds structured validation, `parsePhoneValue`, `getCountryOptions`, Bun maintainer tooling, CI, integration docs, and `PhoneInput` UX improvements. See [CHANGELOG.md](./CHANGELOG.md).

## Features

- **245 supported calling regions** derived from `libphonenumber-js` metadata and `world-countries`
- **Headless hook** via `usePhoneInput()` plus an optional **unstyled reference** `PhoneInput` component (class names only — no bundled CSS)
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
import '@your-app/phone-input.css'; // style .phone-input-* classes

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

## Phone values

| Field | Meaning |
| --- | --- |
| `phone` | National digits stored by the hook (default) |
| `fullPhone` | National number plus dial code when `includeDialCode` is `true` |
| `onChange(phone, country)` | Same contract as `phone` / `includeDialCode` |
| E.164 for APIs | `parsePhoneValue(phone, country).e164` when valid — prefer this over raw concatenation |

## Known behavior

Formatting, length checks, and validity follow **[libphonenumber-js](https://www.npmjs.com/package/libphonenumber-js)** (same family as `react-phone-number-input`). The package does not implement per-country rules outside that library.

## Form integrations

See **[docs/integrations.md](./docs/integrations.md)** for React Hook Form, Formik, Zod, and controlled-input patterns.

## Styled example

A minimal Vite demo using only the hook lives in **[examples/react-styled/](./examples/react-styled/)**.

## Migration from 0.1.x

Compatibility aliases remain exported. Prefer the newer names in new code:

| Deprecated | Replacement |
| --- | --- |
| `setValue` | `setPhone` |
| `value` (hook) | `phone` |
| `allowedCountries` | `onlyCountries` |
| `excludedCountries` | `excludeCountries` |
| `autoDetectCountry` | `autoDetect` |
| `toggle` / `open` / `close` | `toggleDropdown` / `openDropdown` / `closeDropdown` |
| `countries` (hook list) | `filteredCountries` |
| `countrySelectorProps` | `countryButtonProps` |

Validation is unified in 0.2.0: `isValid` and `error` come from the same `validatePhoneNumber` call. Use `validationReason` or `onValidationChange` for structured form messages.

## Development

Requires [Bun](https://bun.sh) (see `packageManager` in `package.json`).

```bash
bun install
bun run test
bun run typecheck
bun run build
bun run lint
```

Manual browser check: `test-demo/` (static HTML).

## Exports

### Components and hooks

- `PhoneInput`
- `usePhoneInput(options)`

### Country data

- `countries`
- `getCountryByCode(code)`
- `getCountryByDialCode(dialCode)`
- `getCountriesByDialCode(dialCode)`
- `getCountryOptions({ locale?, preferredCountries?, excludeCountries?, onlyCountries? })`
- `detectCountryFromPhone(phone)`

### Utilities

- `cleanPhone`, `formatPhone`, `unformatPhone`, `validatePhone`, `validatePhoneLength`
- `validatePhoneNumber` → `{ isValid, reason, message, error }`
- `parsePhoneValue` → `{ country, nationalNumber, e164, isValid }`
- `addDialCode`, `removeDialCode`, `filterCountries`, `getPlaceholder`

Compatibility aliases: `stripNonDigits`, `detectCountry`, `formatPhoneNumber`, `parseToE164`, `getNationalNumber`, `isPhoneNumberComplete`, `formatAsYouType`, `normalizePhoneNumber`, `phoneNumbersEqual`, `getCountryDisplayLabel`, `limitInputLength`.

## `usePhoneInput(options)`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultCountry` | `string` | `'US'` | Default selected country |
| `preferredCountries` | `string[]` | - | Countries shown first in search results |
| `excludeCountries` | `string[]` | - | Countries to exclude |
| `onlyCountries` | `string[]` | - | Restrict selection to these countries |
| `autoDetect` | `boolean` | `true` | Detect country from international numbers |
| `formatOnType` | `boolean` | `true` | Apply live formatting |
| `includeDialCode` | `boolean` | `false` | Return values with dial code included |
| `required` | `boolean` | `false` | Empty value is invalid |
| `validator` | `(phone, country) => boolean` | - | Custom validation override |
| `onValidationChange` | `(state) => void` | - | Fires when validation result changes |

Important returned fields: `phone`, `fullPhone`, `country`, `isValid`, `validationReason`, `error`, `onValidationChange`, `filteredCountries`, `inputProps`, `countryButtonProps`, `dropdownProps`, `getCountryOptionId`.

## License

MIT © Input Kit
