# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.2] - 2026-09-17

### Documentation

- Documented the built-in **format as you type**. Live formatting in the selected country's national format runs on every keystroke via `libphonenumber-js` `AsYouType` (`formatOnType`, on by default), and typing a `+` switches to international format. The README now has a dedicated section, and the Features list calls it out. No behavior change, the formatting was already there.

### Tests

- Added seven regression tests locking the format-as-you-type behavior: progressive national and international formatting, per-country differences (US, GB, DE), delete and paste, `formatOnType: false` showing raw digits, and proof that `phone` / `fullPhone` / `onChange` keep the clean value while only the display is formatted.

## [0.4.0] - 2026-09-16

### Fixed

- **E.164 was wrong for roughly 106 countries.** `addDialCode()`, `parseToE164()` and the `includeDialCode` value were built by concatenating the dial code onto whatever was typed, so the national trunk prefix people actually type survived into the international form: `07400123456` in the UK became `+4407400123456`, and India, Germany, France and Australia were wrong the same way. `validatePhoneNumber()` reported these as valid, so forms submitted them and SMS providers rejected them. Now resolved through libphonenumber metadata, which also keeps the leading zero for countries such as Italy that genuinely use one. North American numbers were never affected, which is why this went unnoticed.
- A national number beginning with its own country's dial code lost the country code entirely. Every Kazakh number (`+7`, and every national number starts with `7`) was affected.
- `onValidationChange` was in its effect's dependency array, so an inline handler (the form the docs lead you to write) re-fired it on every render. A handler that stored the result then set state on every render and React bailed out with "Maximum update depth exceeded". It now fires only when the validation result changes.
- Input beyond the country's maximum length was discarded rather than truncated. When the field was empty that silently blanked it: no value, no `onChange`, no validation message. It now keeps what fits, and an international value is exempt because the selected country's maximum is the wrong yardstick for it.
- Choosing a country did nothing when the value was in international form: auto-detect re-read the old dial code and reverted the selection in the same commit, while `onChange` had already reported the new country. Selecting a country now rewrites the value's dial code so the two agree.
- TypeScript consumers of the CommonJS build under `moduleResolution: node16`/`nodenext` got a hard compile error. `index.d.cts` was being built but never referenced; the `exports` map now declares types per condition.
- The first README example imported a package that does not exist, so the quick start failed to build when copied.

### Accessibility

- The country button announced only its action. A constant `aria-label` overrides an element's own content when computing its accessible name, so the flag and dial code inside the button never reached the accessibility tree, so a screen reader could not tell which country was selected, and choosing one changed nothing audible. The label now carries the current country and dial code, as the WAI-ARIA combobox pattern requires of a collapsed control. Headless consumers get this too, via `countryButtonProps`.
- Closing the dropdown dropped focus to `<body>`, so the next Tab restarted at the top of the page. Focus now returns to the country button on selection and on Escape, from both the option list and the search field (WAI-ARIA APG; WCAG 2.4.3).


## [0.3.0] - 2026-07-22

### Added

- `isPhoneTooLong(phone, country?)`: length check backed by libphonenumber metadata with an E.164 digit-cap fallback
- Input length capping in `usePhoneInput`: typing/pasting beyond the maximum possible length for the selected country is rejected (deletions always allowed)
- `PhoneInput` dropdown: `Home`/`End` keys, and `ArrowDown` from the search input moves focus into the country list

### Fixed

- Auto-detect no longer overrides a manual country selection that still matches the number's dial code (e.g. choosing Canada for a `+1` number no longer flips back to US)
- `onCountryChange` now fires when the `defaultCountry` prop changes at runtime
- `too_short` / `too_long` validation uses `validatePhoneNumberLength` metadata instead of a format-derived digit count. Variable-length countries (e.g. DE, AT) no longer produce false `too_long` results
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
