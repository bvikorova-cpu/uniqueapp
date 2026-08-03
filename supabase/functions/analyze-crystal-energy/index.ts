import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await requireAiCredits(req, corsHeaders, { credits: 3, usageType: "crystal_energy" });
    if (auth.errorResponse) return auth.errorResponse;
    const deduct = auth.deduct!;

    const { imageUrl } = await req.json().catch(() => ({}));
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a crystal energy reading expert. Reply ONLY with strict JSON: " +
              '{"energy_level": number 1-100, "energy_analysis": "detailed multi-paragraph reading in English", "recommended_crystals": ["name", ...]}',
          },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageUrl } },
              { type: "text", text: "Give an energy reading for this crystal." },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const status = res.status === 429 || res.status === 402 ? res.status : 500;
      return new Response(JSON.stringify({ error: data?.error?.message || "AI request failed" }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let reading: any;
    try {
      reading = JSON.parse(raw);
    } catch {
      const m = String(raw).match(/\{[\s\S]*\}/);
      reading = m ? JSON.parse(m[0]) : { energy_level: 70, energy_analysis: String(raw), recommended_crystals: [] };
    }

    reading.energy_level = Math.max(1, Math.min(100, Number(reading.energy_level) || 70));
    reading.energy_analysis = reading.energy_analysis || "No analysis available.";
    reading.recommended_crystals = Array.isArray(reading.recommended_crystals) ? reading.recommended_crystals : [];

    await deduct().catch((e) => console.error("deduct failed:", e));

    return new Response(JSON.stringify({ reading }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[analyze-crystal-energy]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
