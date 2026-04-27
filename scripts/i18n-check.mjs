#!/usr/bin/env node
/**
 * i18n-check — fails the build if any locale is missing keys present in EN.
 * Run as `node scripts/i18n-check.mjs` (also wired to `prebuild` in package.json).
 */
import fs from 'fs';
import path from 'path';

const LOCALES_DIR = 'src/i18n/locales';
const REFERENCE = 'en';

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, key));
    else out[key] = v;
  }
  return out;
}

const ref = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, REFERENCE, 'translation.json'), 'utf8'));
const refFlat = flatten(ref);
const refKeys = new Set(Object.keys(refFlat));

let failed = false;
for (const lang of fs.readdirSync(LOCALES_DIR)) {
  if (lang === REFERENCE) continue;
  const data = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, lang, 'translation.json'), 'utf8'));
  const flat = flatten(data);
  const missing = [...refKeys].filter(k => !(k in flat));
  if (missing.length > 0) {
    console.error(`❌ ${lang}: missing ${missing.length} keys (first 5: ${missing.slice(0, 5).join(', ')})`);
    failed = true;
  } else {
    console.log(`✅ ${lang}: complete (${Object.keys(flat).length} keys)`);
  }
}

if (failed) {
  console.error('\nRun `node scripts/i18n-fill.mjs` to backfill with EN fallback.');
  process.exit(1);
}
