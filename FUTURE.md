# Future Plan

`@input-kit/phone` 0.2.0 shipped structured validation, Bun tooling, CI, integration docs, country hardening, and `PhoneInput` UX fixes. See [CHANGELOG.md](./CHANGELOG.md) for release history.

## Maintainer checklist

Private repo; **Bun** is the standard local and CI toolchain (`bun.lock`, `packageManager` in `package.json`).

Before every npm publish:

```bash
bun install
bun run test
bun run typecheck
bun run build
bun pm pack
```

After publish:

```bash
npm view @input-kit/phone version
npm install @input-kit/phone@latest
```

- Do not remove compatibility aliases without a **major** version.
- Country coverage must stay aligned with `libphonenumber-js`; keep AC/TA/BQ-style fallbacks.
- Patch = fixes and data corrections; minor = backward-compatible APIs; do not skip versions unless correcting a publish mistake.
- Keep `test-demo/` for quick browser QA.

## Near term (0.3.x)

- `lockCountry` or paste-only auto-detect so manual country selection is not overridden while typing
- Dropdown focus trap and optional list typeahead without a search field
- More UI label locales in `labels.ts`
- Richer `examples/` (light/dark) if the styled example grows
- Prep performance work: lazy country list / memoization before virtualization

## API (minor, backward compatible)

- Opt-in `defaultCountry` from `navigator.language` (SSR-safe)
- Evaluate `phoneSchema()` for Zod (docs vs `@input-kit/phone/zod` subpath)
- Document mapping `ValidationReason` to i18n strings in more locales

## Country data

- Re-run checksum baseline when `libphonenumber-js` region set changes
- Renovate/Dependabot for `libphonenumber-js` and `world-countries`, gated by the country-code checksum test

## Demo and docs

- Screenshots or short GIFs (search, auto-detect, validation) for README
- Optional Playwright screenshots on `test-demo` in private CI

## Quality and tooling

- More tests: caret edges, controlled + `includeDialCode` matrix
- ESLint stricter rules only if they stay low-noise for library code

## Possible larger features (1.x or separate packages)

- `@input-kit/phone/styles` optional CSS package
- Virtualized country list primitive
- Non-emoji flags (SVG/sprite)
- Thin React Hook Form adapter package only if [docs/integrations.md](./docs/integrations.md) is not enough
- Optional `metadata` export for non-React consumers
