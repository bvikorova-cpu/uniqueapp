import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const authHeader = req.headers.get("Authorization");
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader?.replace("Bearer ", ""));
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { topic, context, contentType, variantCount } = await req.json();
    if (!topic) return new Response(JSON.stringify({ error: "Missing topic" }), { status: 400, headers: corsHeaders });

    const creditsNeeded = 5;
    const { data: credits } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < creditsNeeded) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), { status: 402, headers: corsHeaders });
    }

    const count = Math.min(variantCount || 3, 5);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert A/B testing copywriter. Generate multiple high-converting variants and recommend the best one with reasoning." },
          { role: "user", content: `Generate ${count} A/B test variants for:\nTopic: ${topic}\nContent Type: ${contentType || "email_subject"}\n${context ? `Context: ${context}` : ""}\n\nEach variant should be unique in approach (emotional, logical, urgency, curiosity, social proof, etc). Recommend the best variant.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_variants",
            description: "Return A/B test variants",
            parameters: {
              type: "object",
              properties: {
                variants: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      content: { type: "string" },
                      reasoning: { type: "string" }
                    },
                    required: ["id", "content", "reasoning"]
                  }
                },
                recommended: { type: "string", description: "ID of recommended variant" }
              },
              required: ["variants", "recommended"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_variants" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: corsHeaders });
      if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: corsHeaders });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const parsed = JSON.parse(toolCall?.function?.arguments || "{}");

    await supabase.from("ai_credits").update({ credits_remaining: credits.credits_remaining - creditsNeeded, last_used_at: new Date().toISOString() }).eq("user_id", user.id);
    await supabase.from("ai_usage_history").insert({ user_id: user.id, usage_type: "ab_testing", credits_used: creditsNeeded, description: `A/B test: ${topic}` });

    return new Response(JSON.stringify({ variants: parsed.variants || [], recommended: parsed.recommended, creditsUsed: creditsNeeded }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("AB test error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});
