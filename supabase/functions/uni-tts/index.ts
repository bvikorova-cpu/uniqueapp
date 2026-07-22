// Uni premium TTS — proxies Lovable AI Gateway /v1/audio/speech with
// openai/gpt-4o-mini-tts. Returns MP3 audio bytes. Auth required; no extra
// credit charge (voice is part of the 5-credit Uni command).
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return json({ error: "LOVABLE_API_KEY missing" }, 500);
    }

    const auth = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "auth_required" }, 401);

    const body = await req.json().catch(() => ({}));
    const text = String(body?.text ?? "").trim().slice(0, 800);
    const voice = String(body?.voice ?? "alloy");
    if (!text) return json({ error: "empty_text" }, 400);

    const ttsRes = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json" },
      body: JSON.stringify({ model: "openai/gpt-4o-mini-tts",
        input: text,
        voice,
        response_format: "mp3",
        instructions: "Speak warmly, clearly and briefly, like a friendly personal assistant." }) });

    if (ttsRes.status === 429) return json({ error: "rate_limited" }, 429);
    if (ttsRes.status === 402) return json({ error: "ai_credits_exhausted" }, 402);
    if (!ttsRes.ok) {
      const t = await ttsRes.text().catch(() => "");
      return json({ error: `tts_error ${ttsRes.status}: ${t.slice(0, 200)}` }, 502);
    }

    return new Response(ttsRes.body, { status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store" } });
  } catch (e) {
    return json({ error: (e as Error).message ?? "unknown" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
