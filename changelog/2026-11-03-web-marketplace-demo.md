# Introduce the HEJI equipment marketplace demo

Date: 2026-11-03

## Summary

Provide a browser-local Chinese marketplace demo for discovering farm equipment and trying rental and purchase intent flows.

## Changes

- Build a responsive React/TypeScript/Vite client with eight fictional listings and locally bundled illustrative images.
- Add search, category and region filters, rental/sale filtering, and sorting. Price sorting requires a single transaction mode.
- Add equipment details, favorites, local publishing, a farm view, and browser persistence with malformed-data recovery and duplicate-ID handling.
- Calculate inclusive calendar-day rental quotes without daylight-saving arithmetic errors. Handle native date input events so quotes update before submission.
- Save rental/purchase intents locally and offer demo reset. These flows do not authenticate users, contact farms, reserve inventory, or collect payments.
- Use native modal dialogs, labeled form controls, visible keyboard focus, and reduced-motion support.

## Validation

- `npm run check`: passed, including 19 tests for filtering, dates, input validation, and storage recovery.
- Browser checks passed for search, favorites, publishing, rental and purchase intents, region filtering, ascending rental-price sorting, persistence after refresh, and reset.
- Verified 680 CNY/day for November 5–7 produces a three-day quote of 2,040 CNY and persists the same amount.
- Checked desktop and 390-pixel mobile layouts: no horizontal overflow or broken images; browser warning/error logs were empty.
- Screenshots and detailed review notes remain in ignored local documentation.
