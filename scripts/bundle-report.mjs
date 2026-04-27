#!/usr/bin/env node
/**
 * bundle-report — sumarizuje veľkosti dist/assets/*.js (raw + gzip + brotli)
 * a vypočíta first-load JS pre úvodnú stránku.
 *
 * Spusti: npm run build && npm run bundle:report
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const DIST = 'dist/assets';
if (!fs.existsSync(DIST)) {
  console.error('❌ dist/assets not found — run `npm run build` first');
  process.exit(1);
}

function fmt(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

const files = fs.readdirSync(DIST)
  .filter(f => f.endsWith('.js'))
  .map(f => {
    const buf = fs.readFileSync(path.join(DIST, f));
    return {
      name: f,
      raw: buf.length,
      gzip: zlib.gzipSync(buf).length,
      brotli: zlib.brotliCompressSync(buf).length,
    };
  })
  .sort((a, b) => b.gzip - a.gzip);

const totalRaw = files.reduce((s, f) => s + f.raw, 0);
const totalGzip = files.reduce((s, f) => s + f.gzip, 0);
const totalBrotli = files.reduce((s, f) => s + f.brotli, 0);

console.log('\n📦 Bundle Report\n' + '─'.repeat(78));
console.log('CHUNK'.padEnd(46) + 'RAW'.padStart(10) + 'GZIP'.padStart(10) + 'BROTLI'.padStart(12));
console.log('─'.repeat(78));
for (const f of files) {
  const short = f.name.length > 44 ? f.name.slice(0, 41) + '...' : f.name;
  console.log(
    short.padEnd(46) +
    fmt(f.raw).padStart(10) +
    fmt(f.gzip).padStart(10) +
    fmt(f.brotli).padStart(12)
  );
}
console.log('─'.repeat(78));
console.log(
  'TOTAL'.padEnd(46) +
  fmt(totalRaw).padStart(10) +
  fmt(totalGzip).padStart(10) +
  fmt(totalBrotli).padStart(12)
);

// First-load = index.html script tags. Approximate: entry chunk + vendor + ui + i18n + supabase + query.
// Read index.html to find what's actually loaded eagerly.
const indexHtml = fs.readFileSync('dist/index.html', 'utf8');
const eagerScripts = [...indexHtml.matchAll(/<script[^>]+src="\/assets\/([^"]+\.js)"/g)].map(m => m[1]);
const eagerTotal = eagerScripts.reduce((sum, name) => {
  const f = files.find(x => x.name === name);
  return sum + (f?.gzip || 0);
}, 0);

console.log('\n🚀 First-load JS (gzip, eager scripts in index.html):');
for (const name of eagerScripts) {
  const f = files.find(x => x.name === name);
  if (f) console.log(`  ${name.padEnd(50)} ${fmt(f.gzip).padStart(10)}`);
}
console.log(`  ${'TOTAL FIRST-LOAD'.padEnd(50)} ${fmt(eagerTotal).padStart(10)}`);

// Heuristic budget warning
const BUDGET = 350 * 1024; // 350 KB gzip
const status = eagerTotal <= BUDGET ? '✅' : '⚠️';
console.log(`\n${status} Budget: ${fmt(eagerTotal)} / ${fmt(BUDGET)} gzip first-load`);
