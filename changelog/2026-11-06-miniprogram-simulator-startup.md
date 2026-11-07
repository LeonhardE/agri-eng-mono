# Run the native demo in the WeChat simulator

Date: 2026-11-06

## Summary

Resolve the MP-001 simulator startup failure and verify the main local demo journeys in official WeChat Developer Tools.

## Changes

- Replace the translation JSON import with an exported JavaScript data module supported by native mini program `require`; add a native-module startup regression check for the app and all six pages.
- Add a client-local, code-only simulator staging command for macOS Documents folder permission failures. Keep the selected development AppID in ignored local configuration and the temporary runtime project.
- Override native v2 button width/margins for compact filters and full-width actions, initialize shared page data before component binding, and use a class selector for component images.
- Shorten localized native dialog buttons to the platform's four-character limit, add a regression check, and surface failed confirmation dialogs.
- Document the reproducible simulator workflow without changing the web app, services, shared tooling or cloud resources.

## Validation

- Simulator: eight fixtures rendered; unmatched search returned zero results; favorite and local intention were saved; missing-date validation worked; an inclusive three-day rental was calculated; invalid publication was rejected and a fictional publication saved.
- Saved publication and intention survived recompilation. Chinese/Uyghur/Xinjiang Kazakh and RTL/font rendering were inspected. Confirmed reset restored Chinese and cleared publications, intentions and favorites.
- Final observed DevTools console: zero application errors, with tool/runtime canary-library, preload and hot-reload notices remaining.
- Mini program source/asset checks and thirteen automated tests: passed.
- Official standalone WXML/WXSS compiler checks: passed (nine templates and eleven stylesheets). Root `npm run check`: passed (web type checking, 33 web tests, production build and repository formatting).
- Physical devices, effective upload package size and invited-user distribution remain unverified. No public release, preview distribution or cloud deployment was performed.
