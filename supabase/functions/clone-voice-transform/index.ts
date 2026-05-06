// Transforms text into a chosen voice style via OpenAI (gpt-4o).
import { callOpenAI, OpenAIError } from "../_shared/openai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    if (!req.headers.get("Authorization")) return j({ error: "No auth" }, 401);
    const { text, style } = await req.json();
    if (!text?.trim()) return j({ error: "text required" }, 400);

    const styleDesc: Record<string, string> = {
      warm: "warm, friendly, slightly casual, with a small touch of emotion or emoji",
      professional: "polished, precise, courteous, business-appropriate",
      energetic: "high-energy, enthusiastic, exclamation-heavy, motivational",
      calm: "calm, measured, soothing, contemplative",
      authoritative: "direct, confident, decisive, leadership-tone",
    };
    const desc = styleDesc[style] || styleDesc.warm;

    try {
      const transformed = (await callOpenAI({
        system: `Rewrite the user's text in a ${desc} voice. Keep meaning. Output only the rewritten text, no preamble.`,
        user: text,
        temperature: 0.7,
      })) || text;
      return j({ transformed });
    } catch (e) {
      if (e instanceof OpenAIError) return j({ error: e.message }, e.status);
      throw e;
    }
  } catch (e: any) {
    return j({ error: e.message }, 500);
  }
});

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
