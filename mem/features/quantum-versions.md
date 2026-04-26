---
name: Quantum Social AI versions
description: quantum-generate-versions edge fn rewrites base post into N tonal variants via Lovable AI Gateway (gemini-2.5-flash). Called from QuantumFeed.createPost.
type: feature
---

## Edge function: `quantum-generate-versions`

`verify_jwt` default. Public CORS. Validates `baseContent` (1–2000 chars) and `tones[]` (1–6 short labels).
Calls `https://ai.gateway.lovable.dev/v1/chat/completions` with `google/gemini-2.5-flash` and
`response_format: json_object`. Returns `{ versions: [{ tone, content }] }` aligned to requested tone order;
backfills missing entries with a tagged fallback (`baseContent (tone)`).

Rate limit (429) and credits-exhausted (402) errors propagate to client.

## Frontend integration

`src/components/quantum-social/QuantumFeed.tsx::createPost` invokes the function after creating the
`quantum_posts` row. On AI failure it inserts plain "(tone)" tagged versions and toasts a warning so
the post still ships.
