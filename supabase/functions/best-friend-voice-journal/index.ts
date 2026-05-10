// Receives an audio blob (multipart/form-data field "audio"), transcribes via Whisper,
// then summarises via gpt-4o-mini. Returns transcript + summary + insight + next_step.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return j({ error: "Unauthorized" }, 401);
    const OPENAI = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI) return j({ error: "no key" }, 500);

    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
    const { data: u } = await anon.auth.getUser();
    if (!u.user) return j({ error: "Unauthorized" }, 401);

    const form = await req.formData();
    const file = form.get("audio");
    if (!(file instanceof File)) return j({ error: "audio file required" }, 400);

    // Transcribe
    const fd = new FormData();
    fd.append("file", file, file.name || "audio.webm");
    fd.append("model", "whisper-1");
    const tResp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST", headers: { Authorization: `Bearer ${OPENAI}` }, body: fd,
    });
    if (!tResp.ok) {
      const t = await tResp.text().catch(()=>"");
      console.error("whisper err", tResp.status, t);
      return j({ error: "transcription failed" }, 502);
    }
    const { text: transcript } = await tResp.json();

    // Summarise
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } });
    const { data: persona } = await admin.from("best_friend_persona")
      .select("language,friend_name").eq("user_id", u.user.id).maybeSingle();
    const lang = persona?.language || "en";

    const sResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `You are ${persona?.friend_name||"Bestie"}, an empathetic AI best friend. Read a voice journal entry and reply in JSON: {"summary":"<1 sentence>","insight":"<1 sentence emotional/psych insight>","next_step":"<1 small actionable suggestion>","mood":"<one word: happy|sad|anxious|angry|calm|excited|tired|grateful>"}. All values in language code "${lang}".` },
          { role: "user", content: transcript || "(no transcript)" },
        ],
      }),
    });
    if (!sResp.ok) return j({ transcript, error: "summary failed" }, 502);
    const sData = await sResp.json();
    let parsed: any = {};
    try { parsed = JSON.parse(sData.choices?.[0]?.message?.content || "{}"); } catch {}

    return j({ transcript, ...parsed });
  } catch (e) {
    return j({ error: String(e) }, 500);
  }
});
function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
