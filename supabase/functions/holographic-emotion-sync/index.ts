import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { spendAiCredits } from "../_shared/spendCredits.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHAT_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const COST = 1;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: userData } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (!user) return json({ error: "UNAUTHORIZED" }, 401);

    const { image, avatarName, avatarStyle } = await req.json();
    if (typeof image !== "string" || !image.startsWith("data:image")) {
      return json({ error: "IMAGE_REQUIRED" }, 400);
    }

    const prompt =
      `You are an emotion recognition engine for a holographic avatar app. ` +
      `Look at the person's face in this photo and detect their current emotion. ` +
      `Allowed emotions: Happy, Sad, Angry, Neutral, Love, Surprised. ` +
      `The user's avatar is named "${avatarName || "their avatar"}" with a ${avatarStyle || "cyber"} holographic style. ` +
      `Reply ONLY with strict JSON: {"emotion":"<one of allowed>","confidence":<0-100 integer>,` +
      `"facial_cues":"<short observation of eyes/mouth/brows>",` +
      `"avatar_reaction":"<1-2 sentences describing how the holographic avatar mirrors this emotion>",` +
      `"suggestion":"<one short friendly tip>"}. No markdown, no extra text. ` +
      `If no face is visible, use emotion "Neutral", confidence 0 and say so in facial_cues.`;

    let parsed: Record<string, unknown> | null = null;
    let lastErr = "";
    for (const model of ["google/gemini-3.6-flash", "google/gemini-2.5-flash"]) {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Lovable-API-Key": LOVABLE_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: image } },
              ],
            },
          ],
        }),
      });
      if (!res.ok) {
        lastErr = `${res.status} ${await res.text()}`;
        console.error("emotion detect failed", model, lastErr);
        continue;
      }
      const data = await res.json();
      const raw = String(data?.choices?.[0]?.message?.content ?? "");
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) { lastErr = `${model}: no JSON in response`; continue; }
      try { parsed = JSON.parse(match[0]); break; } catch { lastErr = `${model}: invalid JSON`; }
    }
    if (!parsed) return json({ error: "AI_FAILED", message: lastErr || "No result" }, 502);

    const spend = await spendAiCredits(admin, user.id, COST, "Emotion Sync scan", "holographic-emotion-sync");
    if (!spend.ok) {
      return json({ error: "INSUFFICIENT_CREDITS", message: spend.error, remaining: spend.remaining }, 402);
    }

    const allowed = ["Happy", "Sad", "Angry", "Neutral", "Love", "Surprised"];
    const emotion = allowed.find((e) => e.toLowerCase() === String(parsed!.emotion ?? "").toLowerCase()) || "Neutral";
    const confidence = Math.max(0, Math.min(100, Math.round(Number(parsed!.confidence) || 0)));

    return json({
      emotion,
      confidence,
      facialCues: String(parsed!.facial_cues ?? ""),
      avatarReaction: String(parsed!.avatar_reaction ?? ""),
      suggestion: String(parsed!.suggestion ?? ""),
      creditsRemaining: spend.remaining,
    });
  } catch (error) {
    console.error("holographic-emotion-sync error:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
