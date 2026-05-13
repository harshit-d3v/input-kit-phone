# Future Plan

This package is stable enough for a patch release. Future work should focus on making it easier to use in production forms, safer to maintain, and clearer for consumers.

## Near Term

- Add a small styled example for React apps, while keeping the core package headless.
- Add docs for common integrations: React Hook Form, Formik, Zod, and plain controlled inputs.
- Add examples for India, US, UK, and shared calling-code regions like `+1`.
- Add a changelog so every npm release has a short human-readable summary.
- Add a GitHub Actions workflow for `npm test`, `npm run typecheck`, and `npm run build`.

## API Improvements

- Keep the current API stable and avoid removing compatibility aliases without a major version.
- Add clearer validation helpers that return structured reasons such as `required`, `too_short`, `too_long`, and `invalid`.
- Add an optional `onValidationChange` callback for form libraries.
- Add a helper for converting phone values into `{ country, nationalNumber, e164, isValid }`.
- Document the difference between `phone`, `fullPhone`, `dialCode`, and E.164 output.

## Country Data

- Keep country coverage aligned with `libphonenumber-js`.
- Add tests for shared calling codes, including `+1`, `+44`, `+61`, `+590`, and `+262`.
- Keep fallback metadata for supported territories that are incomplete in `world-countries`.
- Add a country-list snapshot or checksum test so accidental coverage drops are easy to catch.
- Consider exposing a lightweight `getCountryOptions()` helper for sorted UI lists.

## Demo And Docs

- Replace the plain HTML demo with a Vite example app if the demo grows.
- Keep the current static HTML demo for quick browser checks.
- Add a README section for migration notes from `0.1.x`.
- Add screenshots or short GIFs showing search, auto-detection, validation, and formatting.
- Add a “Known behavior” section for cases where formatting follows `libphonenumber-js`.

## Release Hygiene

- Publish patch versions for fixes and country-data corrections.
- Use minor versions for new public APIs or meaningful new features.
- Do not skip versions unless a publish mistake requires it.
- Before every npm publish, run:

```bash
npm test
npm run typecheck
npm run build
npm pack --dry-run
```

- After publish, verify:

```bash
npm view @input-kit/phone version
npm install @input-kit/phone@latest
```

## Possible Larger Features

- Optional default styles package or CSS file.
- Better accessibility docs and keyboard-navigation examples.
- Locale-aware country names in examples.
- Virtualized country list support for custom UIs.
- Optional flag rendering strategy for environments where emoji flags are not ideal.
- First-party adapters for popular form libraries.

