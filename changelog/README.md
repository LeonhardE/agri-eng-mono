# Change records

This directory keeps a small, reviewable record for each material project change.
Changes confined to `local-doc/` are exempt. For a mixed change, record only the material changes outside `local-doc/`.

## Convention

- Add one Markdown file per change.
- Name it `YYYY-MM-DD-short-description.md`.
- If multiple changes share a date and description, add a numeric suffix.
- Describe the user-visible or architectural result, relevant implementation details, and checks performed.
- Do not include secrets, credentials, or local environment values.
- Keep these tracked change records in English, following the reference repository. Local planning documents use paired `.cn.md` and `.en.md` files.

## Template

```markdown
# Short change title

Date: YYYY-MM-DD

## Summary

Why the change was made and what outcome it provides.

## Changes

- Important change.

## Validation

- Check that was run and its result.
```
