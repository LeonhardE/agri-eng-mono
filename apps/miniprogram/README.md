# HEJI mini program demo

Native WeChat frontend for MP-001, version `0.1.1`. Open this directory as the project root; `miniprogram/` contains the packaged client. No project dependency installation or npm build is needed to run its native source.

## Included

- Discovery with bundled equipment, search in Chinese/Uyghur/Kazakh, category/region/rent-or-sale filters, favorites and sorting. Daily rent and purchase prices are sorted separately.
- Equipment details, calendar-day rental estimates, simulated purchase/rental intentions, and local deletion.
- Simulated publication with validation and category images. Saved publications remain in My; they do not join discovery or enter a real review queue.
- Settings for Chinese, Uyghur and Xinjiang Kazakh, RTL layouts, draft translation notices, and confirmed reset of this demo's data and language preference.
- Existing error messages refresh with the interface language when returning to a cached page. Errors cleared by editing or a successful action stay cleared.
- Eight fictional equipment fixtures, compressed local JPEGs, and an embedded offline Noto Sans Arabic font with its SIL Open Font License. Images and original draft translations are adapted from the existing HEJI web demo; images are category illustrations, not photos of the listed models.

All data is fictional and stored only on the current device under `heji-mp-demo-v1`. No cloud initialization, login, contact-information collection, notifications, payment, location, uploads, analytics or business API calls are included. Saving an intention does not contact a farm or reserve equipment. Use fictional publication text only.

## Development and checks

From the repository root:

```sh
npm run check --prefix apps/miniprogram
npm run compile:local --prefix apps/miniprogram
npm run simulator:prepare --prefix apps/miniprogram
npm run check
```

The first command validates source, local dependencies, complete page files, the conservative 2 MiB source budget, and automated behavior tests. The root check continues to check the existing web workspace and repository formatting; the mini program intentionally has its own client-specific checks without changing repository-wide tooling.

The optional compiler command uses `wcc` and `wcsc` bundled in the standard macOS WeChat DevTools installation. On other installations, pass the compiler directory as an argument:

```sh
npm run compile:local --prefix apps/miniprogram -- /absolute/path/to/wcc-exec
```

This checks all WXML/WXSS files without an AppID and removes its temporary output. The automated tests also start the app and all six pages with JavaScript-only native module resolution, since native `require` cannot import JSON data as Node can. These checks do not replace simulator or physical-device validation.

## Simulator workflow on macOS

If DevTools logs `EPERM` while reading a project under Documents, its `PROJECT_CONFIG_JSON_ERROR` can be a folder access error even when the configuration is valid. The simulator can run a code-only staging copy without granting access to the entire Documents directory.

1. Select an authorized development AppID. The official DevTools **Test Account** entry can provide one for simulator-only development; use an authorized regular account for invited experience distribution. Guest `touristappid` is rejected by the current IDE. Select **None** for backend services.
2. Keep the selected development AppID in the ignored `project.private.config.json` as its top-level `appid`, or pass it to `npm run simulator:prepare --prefix apps/miniprogram -- <authorized-appid>`.
3. The preparation command copies only packaged source and a public AppID configuration to the printed system-temp directory (`/private/tmp/heji-mp-simulator` on macOS). It replaces only that copy's `miniprogram/` source; it does not copy credentials or local IDE preferences, upload code, or create cloud resources.
4. Import/open the printed directory with the official WeChat DevTools Skill. Repeat preparation after repository edits and refresh that simulator project. Keep edits in the repository rather than the temporary copy.

Simulator validation has passed for discovery/search empty states, details, favorites, date validation and inclusive rental totals, local intention saving, publication validation and saving, state restoration after compilation, three languages/RTL, and confirmed reset. The simulator showed zero application errors in the final check; DevTools emitted its own canary-library/preload/hot-reload notices. The user subsequently confirmed that the owner's phone preview opened and was operable, and that a separate invited tester could use the experience version.

## AppID and acceptance boundary

The checked-in `project.config.json` keeps `touristappid` as an unbound scaffold, not a runnable development identity. The workflow above supplies a valid authorized development AppID to the staged project; never substitute a frozen account. A development test account and successful simulator run do not establish invited-user distribution permissions or a one-month trial entitlement. Those conditions must be checked against the selected distribution account.

Broader device acceptance should cover both iOS and Android: navigation/back stack, narrow screens, keyboard visibility, date pickers, all languages and Arabic glyph shaping, favorites, invalid form input, publication, saving/deleting an intention, reopening, and reset. The recorded owner-preview and invited-access confirmations do not establish that full device matrix or a completed month of use.

Development version `0.1.0` was uploaded to the user's selected account through official DevTools, which reported a package size of 1,623,563 bytes. The user confirmed setting it as an experience version, adding an invited tester, and successful access. No public release, review submission or cloud-resource deployment was performed. Research planning and account-specific distribution details remain in the paired, ignored MP-001 ticket. Tracked delivery evidence is recorded in `changelog/2026-11-06-miniprogram-development-upload.md`.

Patch `0.1.1` was subsequently uploaded to the same account after automated checks and simulator validation of cached error messages across all three languages. DevTools reported a package size of 1,624,120 bytes. Selecting this patch as the experience version and checking its displayed version on a phone remain user-side steps. See `changelog/2026-11-06-miniprogram-localized-errors.md`.
