# Establish the monorepo foundation

Date: 2026-11-03

## Summary

Create the repository layout and contributor workflow for a farm equipment marketplace, following the reference financial analysis platform's organization and conventions.

## Changes

- Add npm workspaces and root development, type checking, testing, build, and formatting commands.
- Preserve directory placeholders for the mini-program, five backend services, shared foundations, contracts, design tokens, and Tencent infrastructure. No backend code or cloud resources are provisioned.
- Record scoped Conventional Commits, the required author and Codex co-author, single-target PRs, and change records in `AGENTS.md`.
- Require paired Chinese/English planning documents under the Git-ignored `local-doc/` directory.
- Configure Prettier, a pre-commit quality check, and a GitHub Actions workflow. The workflow has not been run on GitHub in this change.

## Validation

- `npm run check`: type checking, 19 domain tests, production build, and formatting passed.
- `git diff --check`: passed.
- Confirmed `local-doc/`, dependencies, and generated output are ignored.
- Installed the local pre-commit hook with `npm run prepare`.
