---
name: Vertex AI primary
description: Vertex AI (postpay) must be the primary AI provider for the whole platform; Lovable Gateway only as fallback
type: preference
---
Vertex AI (postpay, service account) is the PRIMARY AI provider for every AI call on the platform. Lovable AI Gateway is only a fallback. OpenAI is never called directly.

**How to apply:** every edge function that performs an AI call MUST have `import "../_shared/aiRedirect.ts";` as its first line. That module patches `globalThis.fetch` so calls to `api.openai.com` and `ai.gateway.loable.dev/v1/chat/completions` are attempted on Vertex first (`vertexDirect.ts` / `geminiDirect.ts`) and only fall back to the gateway on failure. Never write a new function that calls the gateway without this import.

**Chat:** `gemini-2.5-flash` / `gemini-2.5-pro` via the Vertex OpenAI-compatible endpoint — WORKING (verified via `vertex-diag`: replies PONG/HELLO).

**Images:** the GCP project (`gen-lang-client-0464493140`, us-central1) does NOT have Imagen or the dedicated image-generation preview models enabled — `imagen-3.0-generate-002` (`:predict`), `gemini-2.0-flash-preview-image-generation`, and `gemini-2.5-flash-image-preview` all return 404, and plain `gemini-2.5-flash` rejects multi-modal output. The ONLY image-capable model enabled is **`gemini-2.5-flash-image`** via the native `:generateContent` endpoint with `generationConfig.responseModalities = ["IMAGE","TEXT"]`. `tryVertexImage` in `vertexDirect.ts` uses this — do NOT revert it to Imagen (`:predict`), it will 404 and force a gateway fallback on every image. Verified working: 1.8 MB PNG returned. Gateway image fallback (`openai/gpt-image-1-mini`) also confirmed working as backup.

**Why:** user requirement, repeated several times — higher limits, postpay billing, no 429s.
