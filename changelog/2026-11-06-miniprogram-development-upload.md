# Upload the HEJI demo development version

Date: 2026-11-06

## Summary

Upload the tested MP-001 frontend as development version `0.1.0` to the user's selected HEJI demo mini program account, following explicit authorization.

## Changes

- Verify the selected account through official DevTools account enumeration, generate a preview package, and receive user confirmation that the new AppID's preview opens and is operable on their phone.
- Upload development version `0.1.0` through the official WeChat DevTools Skill. The tool returned `success: true` and a package size of 1,623,563 bytes.
- Retain the deployment identity in ignored local configuration and an isolated temporary project; shared application configuration and source remain unchanged.
- The upload contains only the fictional-data, device-local frontend demo. It adds no business backend or cloud resources.
- Update the client README with the completed owner-preview and invited-access confirmations, while retaining the limits of device and month-long acceptance.

## Validation

- Official account enumeration, preview generation and development-version upload succeeded for the selected target.
- The user confirmed the owner's new-AppID phone preview opens and is operable.
- The source was already covered by thirteen mini program tests, standalone WXML/WXSS compilation and root `npm run check`; this operation changed no executable source.
- The user confirmed selecting `0.1.0` as an experience version, adding an invited tester, and successful access, then requested close-out. This is user-confirmed acceptance rather than independent backend inspection.
- The planned month of research use has not elapsed; exact dates, full tester roster and longer-term observations remain research arrangements. No public release or review submission was performed.
