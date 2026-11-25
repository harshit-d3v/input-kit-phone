# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.8.0] - 2026-11-25

### Added

- Optional `@input-kit/phone/flags` subpath exporting `CountryFlag`, `renderCountryFlag`, and `getFlagSvg` backed by 245 compact inline 3x2 SVGs (`country-flag-icons` build-time generation), rendering cleanly on Windows with zero CDN requests and 0 KB added to core imports.
- Optional `@input-kit/phone/validation` subpath exporting `getPhoneNumberType`, `isMobilePhone`, `createPhoneTypeValidator`, and `PhoneNumberType` powered by `libphonenumber-js/max`, adding 0 KB to core imports.
- `detectBrowserCountry(fallback?)` SSR-safe zero-network country hint using `Intl.DateTimeFormat().resolvedOptions().timeZone` with `navigator.languages` fallback.
- `formValue` prop on `PhoneInput` (`'e164' | 'full' | 'national'`, defaulting to `'e164'`) submitting clean E.164 or dial-coded values via a hidden `<input>` when `name` is provided.
- Custom string error support for `validator`: returning a non-empty string surfaces that message in `validation.message` / `error`.
- `shadcn/ui` registry component in `registry/phone-input.tsx` + `registry/phone-input.json` (generated via `scripts/build-registry.mjs`) installable with `npx shadcn@latest add`.

### Fixed

- Backspace and Delete adjacent to mask punctuation (such as `(415)| 555-2671` or `81234 |56789`) now skip over the punctuation to delete the neighboring digit cleanly without trapping the cursor.
- Initial country resolution from an E.164 `value` or `defaultValue` now happens synchronously on the first render instead of flipping in a mount effect.
- Browser autofill and bulk paste inputs that include the selected country's dial code without a leading `+` (such as `918123456789` in `IN`) now strip the duplicate prefix cleanly instead of truncating trailing digits.

## [0.7.0] - 2026-11-24

### Added

- Controlled `country` option on `usePhoneInput` and `PhoneInput` (paired with `onCountryChange`, which is no longer marked deprecated).
- Direct `e164` return field on `usePhoneInput()`, returning the valid E.164 string or `undefined` when empty or invalid.
- Localized validation messages (`validationRequired`, `validationTooShort`, `validationTooLong`, `validationInvalid`) in `PhoneInputLabels` across all 11 bundled languages in `labels.ts`, customizable via `labels`.
- `renderFlag` prop on `PhoneInput` for custom flag rendering (such as SVG or ISO badges on platforms without flag emoji support).
- Single-letter typeahead and initial active-option focus when opening `PhoneInput` with `searchable={false}`.

### Changed

- Pre-generated country example format masks into `src/country-data.ts` via `scripts/generate-country-data.mjs`, removing the runtime `libphonenumber-js/mobile/examples` import and 245 startup `getExampleNumber()` calls.
- Upgraded `examples/react-styled` to showcase `countrySearchProps`, `dropdownProps`, `getCountryOptionProps`, `countryResultsText`, controlled `country`, `e164`, localized validation errors, and `<PhoneInput>` with `renderFlag`.

### Fixed

- Headless `countrySearchProps` now includes `onKeyDown` (handling ArrowDown, ArrowUp, Home, End, Enter, Escape), and `getCountryOptionProps` sets `tabIndex` from the active `highlightedIndex`.
- `activeOptionId` / `aria-activedescendant` is now `undefined` while the dropdown is closed, and `getCountryOptionId` scopes option IDs to `listboxId` so multiple phone inputs on one page do not collide.
- Pressing `Enter` in the country search field with zero matches now calls `preventDefault()` so it never submits a parent `<form>`.
- Deferred `Enter`/`Space` trigger focus return until `keyup` so the trigger button does not immediately re-open the dropdown on selection in Chromium.
- Removed the three post-paint `highlightedIndex` `useEffect`s (clamping on render and syncing in actions), preventing first-frame active-option flashes and double renders; unified `setHighlightedIndex` and `moveHighlight` with clamping.
- Kept the `<div role="status">` live region mounted before opening when `searchable` is true and omitted it when `searchable={false}`.
- Stripped optional trunk zeros from pasted international numbers such as `+44 (0) 7400 123456` while preserving countries that keep leading zeros (Italy).
- Made `isPhoneTooLong()` and `limitInputLength()` prefix-aware using `libphonenumber-js` format metadata, so fixed-length prefixes inside variable-length countries (such as 10-digit Indian mobile numbers alongside 13-digit `1800` numbers, or UK/FR numbers without a leading `0`) cap cleanly instead of accepting extra unformatted digits.
- Widened `inputProps.ref` from `RefObject<HTMLInputElement | null>` to `Ref<HTMLInputElement>` so `<input {...inputProps} />` typechecks cleanly under both React 18 and React 19.

## [0.6.0] - 2026-09-19

### Added

- The country search field is now wired as a WAI-ARIA combobox: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"` and `aria-activedescendant`. Focus stays in the search field while ArrowDown, ArrowUp, Home and End move the active option, so you can keep typing to filter. Enter selects the active option. Previously the arrow keys moved DOM focus into the list, which meant a screen reader never announced the active option and you could not keep typing.
- A polite live region announcing how many countries the query matched, or that none did. New `countryResultsAnnouncement` label, localized in all bundled languages, with `{count}` as the placeholder.
- Headless consumers get the same wiring: `countrySearchProps`, `listboxId`, `activeOptionId`, `activeCountry`, `highlightedIndex`, `setHighlightedIndex`, `moveHighlight` and `countryResultsText` from `usePhoneInput()`. `dropdownProps` now carries the listbox `id`, and `countryButtonProps` carries `aria-controls`.

### Changed

- `aria-selected` marks the active option rather than the committed country, which is what a single-select listbox should report. Opening the list makes the already selected country active, so it is announced first.
- Options are out of the tab order while the combobox has focus. With `searchable={false}` there is no combobox and the options keep roving focus exactly as before.

## [0.5.0] - 2026-09-17

### Changed

- Dropped the `world-countries` runtime dependency. The package only used it for country names and dial codes, so those are now generated once into `src/country-data.ts` (about 26 kB) and shipped inside the package. Installing `@input-kit/phone` no longer pulls the full `world-countries` dataset (~600 kB unpacked). The country list, names, dial codes, flags and formats are byte-identical to before. Regenerate the data with `npm run generate:countries` when the libphonenumber region set changes.

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

[Unreleased]: https://github.com/harshit-d3v/input-kit-phone/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/harshit-d3v/input-kit-phone/releases/tag/v0.8.0
[0.7.0]: https://github.com/harshit-d3v/input-kit-phone/releases/tag/v0.7.0
[0.6.0]: https://github.com/harshit-d3v/input-kit-phone/releases/tag/v0.6.0
[0.5.0]: https://github.com/harshit-d3v/input-kit-phone/releases/tag/v0.5.0
[0.4.2]: https://github.com/harshit-d3v/input-kit-phone/releases/tag/v0.4.2
[0.4.0]: https://github.com/harshit-d3v/input-kit-phone/releases/tag/v0.4.0
[0.3.0]: https://github.com/harshit-d3v/input-kit-phone/releases/tag/v0.3.0
[0.2.2]: https://github.com/harshit-d3v/input-kit-phone/releases/tag/v0.2.2
[0.2.1]: https://github.com/harshit-d3v/input-kit-phone/releases/tag/v0.2.1
[0.2.0]: https://github.com/harshit-d3v/input-kit-phone/releases/tag/v0.2.0
