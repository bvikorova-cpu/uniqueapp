---
name: bundle size
description: First-load JS budget, build analyzer setup, and notable heavy chunks to keep lazy-loaded
type: feature
---

## Tooling
- `npm run build:analyze` — produces `dist/bundle-stats.html` (rollup-plugin-visualizer treemap, gzip + brotli sizes).
- `npm run bundle:report` — reads `dist/assets/*.js`, prints per-chunk raw/gzip/brotli + computes first-load JS from `dist/index.html` script tags, warns if first-load > 350 KB gzip.

## Current baseline (2026-04-27)
- **First-load JS (gzip): 206.7 KB** (only `index-*.js` is eager) — well under 350 KB budget.
- Total app bundle: 15.98 MB raw / 4.51 MB gzip across all lazy chunks.
- All routes are `React.lazy`'d → only entry chunk + react/router are eager.

## Heaviest chunks (gzip) — must stay lazy
- `three-*.js` 1.06 MB — only loaded on 3D pages (CrystalEnergyNetwork, MultiverseNetwork, etc.)
- `pdf-*.js` 183 KB — jsPDF + html2canvas, only on certificate/export flows
- `charts-*.js` 125 KB — recharts + d3, only on admin/analytics dashboards
- `markdown-*.js` 119 KB — react-markdown + remark/rehype/katex, only on AI chat results
- `fabric-*.js` 87 KB — only on KidsDrawingBuddy

## Manual chunks (vite.config.ts `manualChunks`)
Keep splitting heavy libs into named chunks: `three`, `pdf`, `fabric`, `charts`, `markdown`, `motion`, `icons`, `forms`, `supabase`, `query`, `ui`, `i18n`, `date`, `vendor`. Adding new heavy dep? Add a rule there.

## Do NOT
- Import `recharts`, `jspdf`, `html2canvas`, `fabric`, `three`, `katex` from non-lazy modules — would inflate first-load.
- Import a page component statically from another page — breaks code-splitting.

