# Attribute commits to the current contributor

Date: 2026-11-07

## Summary

Make the repository's commit-author convention suitable for multiple contributors while preserving each contributor's existing Git identity.

## Changes

- Replace the fixed personal author requirement with the current contributor's configured Git name and email, allowing an explicitly requested identity for a specific task.
- Preserve existing Git identity settings and the current Codex collaboration credit, Conventional Commits format and scope requirements.

## Validation

- Confirmed that the current Git author identity is already configured, so the generalized rule preserves current attribution without changing configuration.
- Reviewed the diff to confirm that the remaining repository instructions retain their existing wording.
- Markdown formatting and whitespace checks passed.
- Root `npm run check` passed: type checking, 33 web tests, production build and repository formatting.
