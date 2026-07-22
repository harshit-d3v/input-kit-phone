# Contributing to @input-kit/phone

Thanks for your interest in improving `@input-kit/phone`! Issues and pull requests are welcome.

## Reporting bugs

Open an issue at <https://github.com/harshit-d3v/input-kit-phone/issues> and include:

- What you did (a minimal code snippet or a StackBlitz/CodeSandbox reproduction helps a lot)
- What you expected to happen and what actually happened
- The package version (`@input-kit/phone`), React version, and browser
- For formatting/validation issues: the exact phone number and country involved — formatting, length checks, and validity all follow [libphonenumber-js](https://www.npmjs.com/package/libphonenumber-js), so a number that libphonenumber considers valid/invalid will behave the same here

## Suggesting features

Open an issue describing the use case first. This package aims to stay a small, headless primitive — new API surface is weighed against bundle size and maintenance cost. Check `FUTURE.md` for what's already planned.

## Development setup

The project uses [Bun](https://bun.sh) as its toolchain (see `packageManager` in `package.json`):

```bash
git clone https://github.com/harshit-d3v/input-kit-phone.git
cd input-kit-phone
bun install
```

Useful commands:

```bash
bun run test        # vitest, single run
bun run test:watch  # vitest in watch mode
bun run typecheck   # tsc --noEmit
bun run lint        # eslint src
bun run build       # tsup (esm + cjs + d.ts)
```

`test-demo/` contains a static HTML page for quick manual browser checks, and `examples/react-styled/` is a minimal Vite demo using the hook.

## Pull requests

1. Fork the repo and create a branch from `main`.
2. Make your change. Keep PRs focused — one fix or feature per PR.
3. Add or update tests for anything user-visible (`src/*.test.ts(x)`).
4. Make sure `bun run test`, `bun run typecheck`, and `bun run lint` pass locally — CI runs the same checks.
5. Update `CHANGELOG.md` under `[Unreleased]` and the README if behavior or API changed.
6. Open the PR with a short description of the problem and the approach.

### Guidelines

- Do not remove or rename exported APIs (including the deprecated compatibility aliases) — those require a major version.
- Country data must stay aligned with `libphonenumber-js`; keep the AC/TA/BQ-style fallbacks in `countries.ts`.
- No new runtime dependencies without discussion in an issue first.
- Follow the existing code style; ESLint (with `react-hooks` rules) is the source of truth.

## Releases

Releases are handled by the maintainer. Versioning follows semver: patch = fixes and data corrections, minor = backward-compatible APIs, major = breaking changes.
