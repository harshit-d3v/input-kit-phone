# Security Policy

## Supported Versions

Only the latest published version of `@input-kit/phone` receives security
updates.

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| older   | :x:                |

## Reporting a Vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, report it privately:

- **GitHub**: use [private vulnerability reporting](https://github.com/harshit-d3v/input-kit-phone/security/advisories/new) ("Report a vulnerability" on the Security tab), or
- **Email**: programming2hars@gmail.com with a description of the issue, steps to reproduce, and the affected version.

You can expect an initial response within a few days. Once the issue is
confirmed, a fix will be prioritized and released as a patch version, and the
report will be credited (unless you prefer to stay anonymous).

## Scope notes

This is a client-side input component. It does not transmit, store, or log
phone numbers itself. Numbers only live in your application's state. Issues in
phone number parsing/validation behavior belong to
[libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js) unless
caused by this package's wrapping logic.
