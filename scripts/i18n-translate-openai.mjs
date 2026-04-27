#!/usr/bin/env node
/**
 * i18n-translate-openai — translates EN-fallback values in target locales via OpenAI.
 *
 * Strategy:
 *   - For each target locale, find keys whose value is identical to the EN value
 *     (those are the ones backfilled by i18n-fill, i.e. not yet translated).
 *   - Send them to OpenAI gpt-4o-mini in batches as JSON, preserving:
 *       * {{interpolation}} placeholders
 *       * HTML tags
 *       * Markdown / emoji
 *   - Write back only the keys that came back changed.
 *
 * Run: OPENAI_API_KEY=... node scripts/i18n-translate-openai.mjs [lang1 lang2 ...]
 *      Default targets: cs de es fr sk
 */
import fs from 'fs';
import path from 'path';

const LOCALES_DIR = 'src/i18n/locales';
const REFERENCE = 'en';
const MODEL = 'gpt-4o-mini';
const BATCH_SIZE = 40;
const MAX_RETRIES = 3;

const LANG_NAMES = {
  cs: 'Czech', de: 'German', es: 'Spanish', fr: 'French', sk: 'Slovak',
  it: 'Italian', hu: 'Hungarian', ru: 'Russian', ja: 'Japanese',
  ko: 'Korean', zh: 'Simplified Chinese',
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY env var required');
  process.exit(1);
}

const targets = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['cs', 'de', 'es', 'fr', 'sk'];

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

async function translateBatch(entries, targetLangName) {
  const payload = Object.fromEntries(entries);
  const system = `You are a professional UI/product translator.
Translate the JSON values from English into ${targetLangName}.
Rules:
- Output VALID JSON ONLY with the exact same keys.
- Do NOT translate or modify {{placeholders}}, HTML tags, URLs, code blocks, emojis.
- Keep punctuation, capitalization style, and tone (concise UI microcopy).
- Never add quotes, commentary or markdown fences around the JSON.`;
  const user = `Translate these UI strings to ${targetLangName}:\n${JSON.stringify(payload)}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          response_format: { type: 'json_object' },
          temperature: 0.2,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t.slice(0, 200)}`);
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response');
      const parsed = JSON.parse(content);
      return parsed;
    } catch (e) {
      console.warn(`  ⚠ batch attempt ${attempt} failed: ${e.message}`);
      if (attempt === MAX_RETRIES) throw e;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

const en = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, REFERENCE, 'translation.json'), 'utf8'));
const enFlat = flatten(en);

for (const lang of targets) {
  const file = path.join(LOCALES_DIR, lang, 'translation.json');
  if (!fs.existsSync(file)) {
    console.warn(`⏭  ${lang}: file not found, skipping`);
    continue;
  }
  const langName = LANG_NAMES[lang] || lang;
  const flat = flatten(JSON.parse(fs.readFileSync(file, 'utf8')));

  // Untranslated = value identical to EN AND value is a non-empty string
  const todo = Object.entries(enFlat).filter(([k, v]) =>
    typeof v === 'string' && v.trim() !== '' && flat[k] === v
  );
  console.log(`\n🌐 ${lang} (${langName}): ${todo.length} strings to translate`);
  if (todo.length === 0) continue;

  let translatedTotal = 0;
  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE);
    process.stdout.write(`  → batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(todo.length / BATCH_SIZE)} (${batch.length})... `);
    try {
      const result = await translateBatch(batch, langName);
      let applied = 0;
      for (const [k, original] of batch) {
        const translated = result[k];
        if (typeof translated === 'string' && translated.trim() && translated !== original) {
          flat[k] = translated;
          applied++;
        }
      }
      translatedTotal += applied;
      console.log(`✓ ${applied} applied`);
      // Persist after every batch so partial progress survives crashes
      fs.writeFileSync(file, JSON.stringify(unflatten(flat), null, 2) + '\n', 'utf8');
    } catch (e) {
      console.log(`✗ skipped (${e.message})`);
    }
  }
  console.log(`✅ ${lang}: ${translatedTotal}/${todo.length} translated`);
}

console.log('\nDone.');
