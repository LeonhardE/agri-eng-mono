# Web demo localization and manual listing review

Date: 2026-11-04

## Summary

Make the existing demo accessible to an initial Xinjiang audience and demonstrate manual review before rental or sale listings become public, using the same Web deployment.

## Changes

- Add settings for Chinese, Uyghur, and Arabic-script Kazakh, including browser-local language preferences, right-to-left layouts, and a bundled open-source Arabic-script font.
- Store interface translations and agricultural terminology in reviewable JSON configuration with draft status and release metadata. Demo translations have not been professionally verified for production.
- Add a Chinese operations review workspace in the same client, with language filters, original submission text, a review checklist, rejection reasons, and local decision history.
- Keep new and legacy local submissions pending until approved; public discovery and transaction intents exclude pending and rejected submissions.
- Keep the backend and infrastructure unimplemented. The review workspace and its history are browser-local demonstrations without real staff authentication or permission enforcement.

## Validation

- `npm run check` passed: TypeScript, 33 tests, production build, and Prettier.
- `git diff --check` passed.
- Browser verification covered language changes and reload persistence, desktop and 390px RTL layouts, three-language submissions, disabled transaction forms for pending listings, approval visibility, rejection reasons, and persistence of review decisions. The final fresh page had no console warnings or errors.
