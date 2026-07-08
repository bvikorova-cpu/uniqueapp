import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = await requireAiCredits(req, corsHeaders, { credits: 3, usageType: "music_studio_ai" });
    if (auth.errorResponse) return auth.errorResponse;
    const deduct = auth.deduct!;

    const { brief = "", genre = "any", mood = "any" } = await req.json();
    if (typeof brief !== "string" || brief.length > 500) {
      return new Response(JSON.stringify({ error: "brief too long" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("AI service not configured");

    const sys = `You are a professional music producer. Return STRICT JSON only, no prose, no markdown, matching this TypeScript type:
{ "title": string, "genre": string, "bpm": number, "key": string, "mood": string, "chords": string[], "structure": string[], "instruments": string[], "mixingTips": string[], "referenceTracks": string[] }`;
    const user = `Brief: ${brief || "(none)"}\nGenre preference: ${genre}\nMood: ${mood}\nProduce a complete track concept.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        response_format: { type: "json_object" },
        max_completion_tokens: 900,
      }),
    });

    if (!res.ok) throw new Error(`AI upstream ${res.status}`);
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    let concept: unknown;
    try { concept = JSON.parse(raw); } catch { concept = { title: "Untitled", chords: [], structure: [], instruments: [], mixingTips: [], referenceTracks: [] }; }

    await deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(JSON.stringify({ concept }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
