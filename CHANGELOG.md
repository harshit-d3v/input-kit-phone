# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/input-kit/input-kit-phone/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/input-kit/input-kit-phone/releases/tag/v0.2.0
