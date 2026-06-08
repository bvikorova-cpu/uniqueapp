// Kids Story TTS — converts story text to speech using OpenAI TTS
// Returns base64 MP3 audio for client playback
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const TTS_COST = 1; // per page, per credit matrix
const MAX_TEXT_LENGTH = 4000; // OpenAI TTS hard limit is 4096 chars
const ALLOWED_VOICES = new Set([
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }



  try {
    console.log("kids-story-tts request received, method:", req.method);
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // SECURITY: require valid JWT to prevent unauthenticated OpenAI quota burn.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
    const { data: userData, error: authError } = await admin.auth.getUser(token);
    if (authError || !userData?.user?.id) {
      console.warn("kids-story-tts auth rejected:", authError?.message, "user:", userData?.user?.id);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Rate limit: 30 TTS requests / 5 min per user
    const { data: allowed } = await admin.rpc("check_rate_limit", {
      p_identifier: userData.user.id,
      p_action_type: "kids_story_tts",
      p_max_requests: 30,
      p_window_seconds: 300,
    });
    if (allowed === false) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Try again in a few minutes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }


    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("OPENAI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "TTS service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let body: { text?: unknown; voice?: unknown };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const text = typeof body.text === "string" ? body.text.trim() : "";
    const voice =
      typeof body.voice === "string" && ALLOWED_VOICES.has(body.voice)
        ? body.voice
        : "nova"; // friendly default for kids

    if (!text) {
      return new Response(
        JSON.stringify({ error: "text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Credit pre-check (deduction happens AFTER successful TTS, so failures don't burn credits).
    const userId = userData.user.id;
    const { data: credRow } = await admin
      .from("kids_story_credits")
      .select("credits_remaining")
      .eq("user_id", userId)
      .maybeSingle();
    const balance = credRow?.credits_remaining ?? 0;
    if (!credRow) {
      await admin.from("kids_story_credits").insert({
        user_id: userId, credits_remaining: 0, total_credits_purchased: 0,
      });
    }
    if (balance < TTS_COST) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits", credits_remaining: balance, cost: TTS_COST }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const truncated = text.slice(0, MAX_TEXT_LENGTH);

    const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice,
        input: truncated,
        response_format: "mp3",
        speed: 0.95,
      }),
    });

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text();
      console.error("OpenAI TTS error:", ttsResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "TTS generation failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const audioBuffer = await ttsResponse.arrayBuffer();

    // Convert to base64 in chunks to avoid stack overflow on large buffers
    const bytes = new Uint8Array(audioBuffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const audioBase64 = btoa(binary);

    // Deduct credit only after successful audio synthesis
    const newBalance = balance - TTS_COST;
    await admin
      .from("kids_story_credits")
      .update({ credits_remaining: newBalance, last_used_at: new Date().toISOString() })
      .eq("user_id", userId);

    return new Response(
      JSON.stringify({ audioContent: audioBase64, mimeType: "audio/mpeg", credits_remaining: newBalance, cost: TTS_COST }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("kids-story-tts unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
