---
name: i18n completeness
description: How translation files stay in sync — EN is the source of truth, build fails if any locale is missing keys
type: feature
---

## Source of truth
`src/i18n/locales/en/translation.json` is the canonical key list (702 keys). All 11 other locales must contain the same key tree.

## Tooling (`scripts/`)
- `i18n-check.mjs` — flattens EN, compares against every other locale, **exits non-zero** if any keys are missing. Wired to `prebuild` so a release with missing keys cannot ship.
- `i18n-fill.mjs` — copies missing EN values into every locale (idempotent). Run manually after adding new keys: `npm run i18n:fill`.

## Workflow when adding new strings
1. Add the new key to `en/translation.json`.
2. Run `npm run i18n:fill` → all locales receive the EN string as a placeholder.
3. Translators (or AI) overwrite placeholders per locale.
4. `npm run i18n:check` validates before merge / build.

## Current state (after Phase i18n-1)
- All 12 locales have all 702 keys.
- CS, DE, ES, FR, SK previously had only 90–138 keys → backfilled with EN fallback. They render in English until properly translated, but never as raw `services.bazaar.title`.

## Do NOT
- Manually edit individual locale files to add a brand-new key — always start in EN, then fill.
- Delete keys from EN without removing them from every other locale (CI would still pass, but app would carry dead strings).
