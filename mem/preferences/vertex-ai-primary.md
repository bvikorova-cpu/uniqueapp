---
name: Vertex AI primary
description: Vertex AI (postpay) must be the primary AI provider for the whole platform; Lovable Gateway only as fallback
type: preference
---
Vertex AI (postpay, service account) is the PRIMARY AI provider for every AI call on the platform. Lovable AI Gateway is only a fallback. OpenAI is never called directly.

**How to apply:** every edge function that performs an AI call MUST have `import "../_shared/aiRedirect.ts";` as its first line. That module patches `globalThis.fetch` so calls to `api.openai.com` and `ai.gateway.lovable.dev/v1/chat/completions` are attempted on Vertex first (`vertexDirect.ts` / `geminiDirect.ts`) and only fall back to the gateway on failure. Never write a new function that calls the gateway without this import.

**Why:** user requirement, repeated several times — higher limits, postpay billing, no 429s.
