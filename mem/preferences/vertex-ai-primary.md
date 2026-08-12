---
name: Vertex AI only
description: Vertex AI (postpay) is the ONLY AI provider on the platform; Lovable AI Gateway must never be used.
type: preference
---
All AI on the platform (chat, images, embeddings, TTS, transcription) runs exclusively on **Vertex AI (postpay)** via `supabase/functions/_shared/aiRedirect.ts` + `vertexDirect.ts`.

**How to apply:**
- `aiRedirect.ts` patches `globalThis.fetch`: any call to `api.openai.com` or `ai.gateway.lovable.dev` is served by Vertex. There is NO Lovable Gateway fallback — failures return 503 `ai_unavailable`.
- Every AI edge function must `import "../_shared/aiRedirect.ts";`.
- Vertex models: chat `gemini-2.5-flash` / `-lite` / `-pro` (OpenAI-compatible endpoint), images `gemini-2.5-flash-image` (+ preview fallbacks, retried on 429), embeddings `text-embedding-005`, TTS `gemini-2.5-flash-preview-tts` (WAV-wrapped PCM), STT `gemini-2.5-flash` audio input.
- Imagen models are NOT enabled on the GCP project (404) — do not use them.

**Why:** user requirement — postpay Vertex billing, no Lovable AI credits.
