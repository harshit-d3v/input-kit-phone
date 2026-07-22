# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-07-22

### Added

- `isPhoneTooLong(phone, country?)` — length check backed by libphonenumber metadata with an E.164 digit-cap fallback
- Input length capping in `usePhoneInput`: typing/pasting beyond the maximum possible length for the selected country is rejected (deletions always allowed)
- `PhoneInput` dropdown: `Home`/`End` keys, and `ArrowDown` from the search input moves focus into the country list

### Fixed

- Auto-detect no longer overrides a manual country selection that still matches the number's dial code (e.g. choosing Canada for a `+1` number no longer flips back to US)
- `onCountryChange` now fires when the `defaultCountry` prop changes at runtime
- `too_short` / `too_long` validation uses `validatePhoneNumberLength` metadata instead of a format-derived digit count — variable-length countries (e.g. DE, AT) no longer produce false `too_long` results
- `formatPhoneNumber(phone, null, 'national')` no longer silently truncates numbers to 9 digits
- `aria-invalid` is now set when the field is `required` and empty
- SSR: caret restoration uses an isomorphic layout effect, removing the `useLayoutEffect` warning in server rendering (e.g. Next.js)

### Changed

- `too_long` validation message no longer embeds a format-derived max ("Phone number is too long")
- `PhoneInput` listbox uses a single focus model (roving focus); `aria-activedescendant` removed
- Published output is no longer minified (better stack traces; consumer bundlers minify anyway)
- `main` points at the CJS build (`dist/index.cjs`) for legacy resolvers; `exports` exposes `./package.json`
- `package.json` gained `repository` / `homepage` / `bugs` links
- ESLint: added `eslint-plugin-react-hooks` (rules-of-hooks: error, exhaustive-deps: warn)

## [0.2.2] - 2026-05-28

### Documentation

- README cleanup for npm readers: inline Latest update only; removed links and bullets pointing at `docs/integrations.md`, GitHub `CHANGELOG.md`, and similar repo-only markdown
- Form integrations section shortened to inline guidance (no `docs/integrations.md` pointer)

## [0.2.1] - 2026-05-28

### Documentation

- README Latest update: inline 0.2.0 highlights; fix broken npm CHANGELOG link (point to GitHub changelog)

## [0.2.0] - 2026-05-28

### Added

- Structured validation: `ValidationReason`, unified `validatePhoneNumber` result (`reason`, `message`, `error`), and `onValidationChange` on `usePhoneInput`
- `parsePhoneValue(phone, country?)` for `{ country, nationalNumber, e164, isValid }`
- `getCountryOptions()` for sorted UI option lists with locale and country filters
- Country tests for shared calling codes (`+44`, `+61`, `+590`, `+262`) and a country-code checksum baseline
- `PhoneInput` click-outside close, `aria-activedescendant`, and RTL component tests
- CI workflow (Bun), `CHANGELOG.md`, integration docs, and `examples/react-styled`
- Minimal ESLint flat config for `src/**/*.{ts,tsx}`

### Changed

- Bun as the maintainer toolchain (`bun.lock`, `packageManager`, README dev commands)
- `prepublishOnly` runs test, typecheck, and build
- Hook `isValid` and `error` derive from the same validation function
- Consistent `aria-haspopup="listbox"` on country selector props

### Documentation

- README: value semantics table, known libphonenumber behavior, 0.1.x migration, unstyled `PhoneInput` note
- `docs/integrations.md` for React Hook Form, Formik, Zod, and controlled inputs
- Refreshed `FUTURE.md` for the next development phase

[Unreleased]: https://github.com/harshit-d3v/input-kit-phone/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/harshit-d3v/input-kit-phone/releases/tag/v0.3.0
[0.2.2]: https://github.com/harshit-d3v/input-kit-phone/releases/tag/v0.2.2
[0.2.1]: https://github.com/harshit-d3v/input-kit-phone/releases/tag/v0.2.1
[0.2.0]: https://github.com/harshit-d3v/input-kit-phone/releases/tag/v0.2.0
