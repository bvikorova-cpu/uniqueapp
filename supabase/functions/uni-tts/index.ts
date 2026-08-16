import "../_shared/aiRedirect.ts";
// Uni premium TTS — proxies /v1/audio/speech (served by Vertex Gemini-TTS).
// Returns audio bytes. Auth required; no extra credit charge (voice is part of
// the 5-credit Uni command).
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

/** Native-speaker pronunciation profile per supported language. */
const LANGS: Record<string, { name: string; locale: string; note: string }> = {
  en: { name: "English", locale: "en-US", note: "clear General American vowels, natural sentence stress" },
  sk: { name: "Slovak", locale: "sk-SK", note: "stress always on the first syllable, soft ď/ť/ň/ľ, long vowels held (á, é, í, ó, ú, ý), no vowel reduction" },
  cs: { name: "Czech", locale: "cs-CZ", note: "stress on the first syllable, correct ř, soft ě/ď/ť/ň, long vowels held, no vowel reduction" },
  de: { name: "German", locale: "de-DE", note: "front rounded ü/ö, uvular r, crisp final consonants, correct umlauts and ch sounds" },
  es: { name: "Spanish", locale: "es-ES", note: "pure five-vowel system, tapped r and trilled rr, penultimate-syllable stress unless accented" },
  fr: { name: "French", locale: "fr-FR", note: "nasal vowels, uvular r, liaison between words, stress on the final syllable of each group" },
  it: { name: "Italian", locale: "it-IT", note: "open clear vowels, doubled consonants pronounced long, penultimate stress" },
  hu: { name: "Hungarian", locale: "hu-HU", note: "stress always on the first syllable, long vowels (á, é, ő, ű) clearly held, front rounded ö/ü" },
  pl: { name: "Polish", locale: "pl-PL", note: "penultimate stress, correct sz/cz/rz and nasal ą/ę" },
  ru: { name: "Russian", locale: "ru-RU", note: "vowel reduction in unstressed syllables, palatalised consonants, correct word stress" },
  ja: { name: "Japanese", locale: "ja-JP", note: "mora-timed rhythm, correct pitch accent, no English-style stress" },
  ko: { name: "Korean", locale: "ko-KR", note: "syllable-timed rhythm, correct tense/aspirated consonants, no English intonation" },
  zh: { name: "Mandarin Chinese", locale: "zh-CN", note: "accurate tones on every syllable, neutral-tone particles kept light" },
};

/** Gemini-TTS prebuilt voices that carry the requested language most naturally. */
const VOICE_BY_LANG: Record<string, string> = {
  en: "Kore", sk: "Aoede", cs: "Aoede", de: "Charon", es: "Aoede", fr: "Aoede",
  it: "Aoede", hu: "Aoede", pl: "Aoede", ru: "Charon", ja: "Leda", ko: "Leda", zh: "Leda",
};

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
    if (!text) return json({ error: "empty_text" }, 400);

    const langCode = String(body?.lang ?? "en").split("-")[0].toLowerCase();
    const profile = LANGS[langCode] ?? LANGS.en;
    const voice = typeof body?.voice === "string" && /^[A-Z][a-z]+$/.test(body.voice)
      ? body.voice
      : (VOICE_BY_LANG[langCode] ?? "Kore");

    const instructions = [
      `Read the following text aloud entirely in ${profile.name} (${profile.locale}) as a native speaker born and raised in that language.`,
      `Use fully native phonemes and prosody: ${profile.note}.`,
      "Never apply English (or any other foreign) phonetics, stress pattern or intonation — no foreign accent at all.",
      "Pronounce loanwords, names, numbers and units the way a native speaker of this language naturally would.",
      "Tone: warm, calm, professional, conversational — like a friendly personal assistant talking to one person.",
      "Speak at a natural pace with human pauses at punctuation. Do not read markdown symbols, and do not add any commentary.",
    ].join(" ");

    const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini-tts",
        input: text,
        voice,
        language: profile.locale,
        response_format: "mp3",
        instructions }) });

    if (ttsRes.status === 429) return json({ error: "rate_limited" }, 429);
    if (ttsRes.status === 402) return json({ error: "ai_credits_exhausted" }, 402);
    if (!ttsRes.ok) {
      const t = await ttsRes.text().catch(() => "");
      return json({ error: `tts_error ${ttsRes.status}: ${t.slice(0, 200)}` }, 502);
    }

    return new Response(ttsRes.body, { status: 200,
      headers: {
        ...corsHeaders,
        // Vertex returns WAV; OpenAI-compatible callers may return MP3.
        "Content-Type": ttsRes.headers.get("Content-Type") ?? "audio/wav",
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
