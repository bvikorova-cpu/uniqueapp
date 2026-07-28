// Translate text into the requested language and synthesize it with OpenAI TTS.
// Returns { audioContent: base64 mp3, translatedText, language }.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_TEXT = 3500;

const LANG_NAMES: Record<string, string> = {
  en: "English",
  sk: "Slovak",
  cs: "Czech",
  de: "German",
  es: "Spanish",
  fr: "French",
  it: "Italian",
  hu: "Hungarian",
  pl: "Polish",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese (Simplified)",
  pt: "Portuguese",
  nl: "Dutch",
};

function base64FromBuffer(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return json({ error: "TTS service not configured" }, 500);

    let body: { text?: unknown; language?: unknown; voice?: unknown; speed?: unknown };
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const rawText = typeof body.text === "string" ? body.text.trim() : "";
    if (!rawText) return json({ error: "text is required" }, 400);

    const langCode = (typeof body.language === "string" ? body.language : "en")
      .toLowerCase()
      .split(/[-_]/)[0];
    const langName = LANG_NAMES[langCode] ?? "English";
    const voice = typeof body.voice === "string" ? body.voice : "nova";
    const speed = Math.min(1.1, Math.max(0.7, typeof body.speed === "number" ? body.speed : 0.95));

    const source = rawText.slice(0, MAX_TEXT);
    let translated = source;

    if (langCode !== "en") {
      const tr = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                `You are a professional translator. Translate the user's text into natural, fluent ${langName}. ` +
                `Keep the same tone and meaning, keep proper names untranslated, and reply with the translation ONLY — no notes, no quotes.`,
            },
            { role: "user", content: source },
          ],
        }),
      });
      if (tr.ok) {
        const data = await tr.json();
        const out = data?.choices?.[0]?.message?.content?.trim();
        if (out) translated = out;
      } else {
        console.error("translation failed:", tr.status, await tr.text());
      }
    }

    const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        input: translated,
        voice,
        speed,
        response_format: "mp3",
        instructions: `Speak in ${langName} with a natural native ${langName} accent and clear, warm storytelling delivery.`,
      }),
    });

    if (!ttsRes.ok) {
      const details = await ttsRes.text();
      console.error("TTS failed:", ttsRes.status, details);
      return json({ error: "TTS failed", status: ttsRes.status, details, translatedText: translated }, ttsRes.status);
    }

    const audioContent = base64FromBuffer(await ttsRes.arrayBuffer());
    return json({ audioContent, translatedText: translated, language: langCode });
  } catch (e) {
    console.error("translate-and-generate-audio error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
