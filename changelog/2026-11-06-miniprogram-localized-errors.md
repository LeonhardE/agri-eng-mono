# Refresh cached demo errors after a language change

Date: 2026-11-06

## Summary

Fix stale Chinese validation messages on cached mini program pages after switching the interface to Uyghur or Xinjiang Kazakh, and prepare patch version `0.1.1`.

## Changes

- Retain the error's translation key in the shared page helper and translate a visible error again when refreshing the page's language.
- Preserve cleared error states after editing, successful actions or reset. Keep user-authored publication text unchanged.
- Update the client package and displayed version to `0.1.1`.
- Add a regression covering publication and rental-date errors across Chinese, Uyghur and Xinjiang Kazakh, including a return to Chinese and cleared-error behavior.

## Validation

- The regression reproduced the stale Chinese publication error before the fix.
- Mini program source/asset checks and fourteen automated tests: passed.
- Official standalone `wcc` and `wcsc`: nine templates and eleven stylesheets compiled successfully.
- Root `npm run check`: passed (web type checking, 33 web tests, production build and repository formatting).
- Official simulator: triggered an empty publication error in Chinese, switched to Uyghur and then Xinjiang Kazakh through settings, and confirmed the same cached page displayed each language's validation message.
- Verified that all 54 packaged source files in the upload staging project matched the repository source.
- The user authorized the patch upload and confirmed the DevTools upload prompt. The final official task result reported success for development version `0.1.1`, with a package size of 1,624,120 bytes.
- Experience-version selection and physical-device acceptance of `0.1.1` remain pending user action. No public release or review submission was performed.
