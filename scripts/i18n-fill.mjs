#!/usr/bin/env node
/**
 * i18n-fill — copies missing keys from EN into every other locale so the app
 * never renders raw key paths. Translators then overwrite these placeholders.
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

function unflatten(flat) {
  const out = {};
  for (const [k, v] of Object.entries(flat)) {
    const parts = k.split('.');
    let cur = out;
    for (let i = 0; i < parts.length - 1; i++) {
      if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = v;
  }
  return out;
}

const ref = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, REFERENCE, 'translation.json'), 'utf8'));
const refFlat = flatten(ref);

for (const lang of fs.readdirSync(LOCALES_DIR)) {
  if (lang === REFERENCE) continue;
  const file = path.join(LOCALES_DIR, lang, 'translation.json');
  const flat = flatten(JSON.parse(fs.readFileSync(file, 'utf8')));
  let added = 0;
  for (const [k, v] of Object.entries(refFlat)) {
    if (!(k in flat)) { flat[k] = v; added++; }
  }
  if (added > 0) {
    fs.writeFileSync(file, JSON.stringify(unflatten(flat), null, 2) + '\n', 'utf8');
    console.log(`📝 ${lang}: filled ${added} keys`);
  } else {
    console.log(`✅ ${lang}: already complete`);
  }
}
