# Add the HEJI native mini program frontend demo

Date: 2026-11-06

## Summary

Implement the MP-001 frontend demo in `apps/miniprogram` with fictional bundled data and device-local state, ready for subsequent simulator and physical-device acceptance once an authorized AppID is available.

## Changes

- Add six native pages: discovery, simulated publication, My, details, simulated intention confirmation, and settings, with a text-only custom tab bar.
- Support multilingual search, category/region/mode filtering, comparable-price sorting, favorites, calendar-day rental estimates, local intention deletion, publication validation, and confirmed reset.
- Adapt the existing HEJI fixtures, compressed local images, draft Chinese/Uyghur/Xinjiang Kazakh copy, and offline licensed Arabic font. Preserve original user-authored text and clearly label draft translations, fictional data, and device-only storage.
- Validate persisted records and handle write failures without claiming successful saves. Exclude cloud services, authentication, payments, contact collection, notifications, inventory reservations, uploads and analytics.
- Add client-local source checks, behavior tests and optional standalone validation with official DevTools WXML/WXSS compilers. Keep the existing web client and repository-wide tooling unchanged.

## Validation

- Mini program source/dependency/asset and conservative 2 MiB source-budget check: passed.
- Automated domain, persistence, localization and page-flow tests: passed.
- Official bundled `wcc` and `wcsc`: all nine templates and eleven stylesheets compiled successfully.
- Root `npm run check`: passed (web type checking, 33 web tests, production build, and repository formatting).
- Official CloudBase domestic `auth(status)` and WeChat Skill status calls succeeded. Project import/open returned `PROJECT_CONFIG_JSON_ERROR` despite parseable configuration; the Skill guide also rejects guest AppIDs. The desktop import attempt timed out. No complete simulator run, physical-device acceptance, actual uploaded-package measurement or invited-user access is claimed.
