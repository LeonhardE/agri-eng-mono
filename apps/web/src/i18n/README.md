# Demo language configuration

`messages.json` contains stable message IDs, the Chinese source, Uyghur (`ug`), and Xinjiang Arabic-script Kazakh (`kk`) demo translations. Per-language review status, reviewer, and review date sit next to each message. Keep IDs stable when editing wording. Preserve interpolation tokens such as `{title}` exactly.

`glossary.json` links agricultural and transaction terms to their messages and records their intended meaning, evidence, and specialist sign-off. A bilingual reviewer and an agricultural specialist should verify terminology, units, commercial meaning, and Arabic-script display before a production release. All minority-language translations currently remain **drafts**; no specialist review is claimed.

`release.json` explicitly enables drafts only for this demo. A future production pipeline must reject incomplete or unapproved messages and glossary entries, validate matching placeholders, record reviewer identity and evidence, then produce an immutable approved release. Setting `productionApproved` by itself is not approval. `translate(..., false)` already falls back to Chinese for unapproved entries; runtime production enforcement and a remote configuration service are planned, not implemented.

The user's preferred locale is separate browser-local state (`heji-language-v1`). UI switching does not translate user submissions. Fictional bundled equipment descriptions are translated; original brand/model and place/farm names remain. Submitted content carries a separate author-selected language for operations review. The browser-local admin demo is not an authorization boundary.

Arabic-script text uses the bundled Noto Sans Arabic font from [Google Fonts](https://github.com/google/fonts/tree/main/ofl/notosansarabic), distributed under the SIL Open Font License in `apps/web/public/fonts/OFL.txt`. No external font request is needed.
