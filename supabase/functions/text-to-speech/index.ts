import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const MAX_TEXT = 3500;

const LANG_NAMES: Record<string, string> = {
  en: "English", sk: "Slovak", cs: "Czech", de: "German", es: "Spanish",
  fr: "French", it: "Italian", hu: "Hungarian", pl: "Polish", ru: "Russian",
  ja: "Japanese", ko: "Korean", zh: "Chinese (Simplified)", pt: "Portuguese",
  nl: "Dutch" };

function base64FromBuffer(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    // Auth gate — prevent anonymous credit-burn against OpenAI TTS.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user?.id) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const rawText = typeof body?.text === "string" ? body.text.trim() : "";
    if (!rawText) return json({ error: "Text required" }, 400);

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) return json({ error: "OpenAI API key not configured" }, 500);

    const langCode = String(body?.language ?? "en").toLowerCase().split(/[-_]/)[0];
    const langName = LANG_NAMES[langCode] ?? "English";
    const voice = typeof body?.voice === "string" ? body.voice : "nova";
    const speed = Math.min(1.1, Math.max(0.7, typeof body?.speed === "number" ? body.speed : 0.95));

    const source = rawText.slice(0, MAX_TEXT);
    let translated = source;

    // Translate first so the narration is in the requested language (and the
    // TTS voice uses a native accent instead of reading foreign text).
    if (langCode !== "en") {
      const tr = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            { role: "system",
              content: `You are a professional translator. Translate the user's text into natural, fluent ${langName}. Keep the tone and meaning, keep proper names untranslated, and reply with the translation ONLY — no notes, no quotes.` },
            { role: "user", content: source },
          ] }) });
      if (tr.ok) {
        const d = await tr.json();
        const out = d?.choices?.[0]?.message?.content?.trim();
        if (out) translated = out;
      } else {
        console.error("translation failed:", tr.status, await tr.text());
      }
    }

    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini-tts",
        input: translated,
        voice,
        speed,
        response_format: "mp3",
        instructions: `Speak in ${langName} with a natural native ${langName} accent, warm and clear storytelling delivery.` }) });

    if (!res.ok) {
      const details = await res.text().catch(() => "");
      console.error("TTS failed:", res.status, details);
      return json({ error: "TTS generation failed", status: res.status, details: details.slice(0, 300), translatedText: translated }, 502);
    }

    const audioContent = base64FromBuffer(await res.arrayBuffer());

    return json({ audioContent,
      audioUrl: `data:audio/mpeg;base64,${audioContent}`,
      translatedText: translated,
      language: langCode });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
