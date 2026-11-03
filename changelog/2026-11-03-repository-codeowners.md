# Assign repository code ownership

Date: 2026-11-03

## Summary

Designate LeonhardE as the code owner for all repository files so GitHub can request the owner's review on pull requests.

## Changes

- Add `.github/CODEOWNERS` with the repository-wide pattern `* @LeonhardE`, covering the ownership file itself.
- Requiring code-owner approval is configured separately through GitHub rulesets by the repository owner; no ruleset settings are changed here.
- Keep local planning documents and generated PDFs excluded from version control.

## Validation

- Confirmed there is one repository-wide ownership rule and no overriding patterns.
- `npm run check`: type checking, 19 domain tests, production build, and formatting passed.
- `git diff --check`: passed.
