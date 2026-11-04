# Add a minimal demo README

Date: 2026-11-03

## Summary

Give repository visitors a short introduction and reproducible setup instructions without presenting tentative product ideas as confirmed requirements.

## Changes

- Add a root README describing the current Web demo and browser-local fictional data.
- Document `npm ci`, the development URL, the required Node.js version, and the existing quality/build command.
- Keep detailed planning documents, screenshots, and PDFs in the ignored `local-doc/` directory.

## Validation

- `npm run check`: type checking, 19 domain tests, production build, and formatting passed.
- `git diff --check`: passed.
