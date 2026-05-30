import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST = 2;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Early auth pre-check (returns 401 instead of crashing inside try → 500)
  const _earlyAuth = req.headers.get("Authorization");
  if (!_earlyAuth || !_earlyAuth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { brandAId, brandBId } = await req.json();
    if (!brandAId || !brandBId) throw new Error("brandAId and brandBId required");

    // Charge user
    const { data: votes } = await adminClient
      .from("brand_votes").select("*").eq("user_id", user.id).maybeSingle();

    if (!votes || (votes.purchased_votes ?? 0) < COST) {
      return new Response(JSON.stringify({ error: "Need at least 2 vote credits to use AI Predictor.", required: COST }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: brands } = await adminClient
      .from("brand_sponsors").select("*").in("id", [brandAId, brandBId]);
    if (!brands || brands.length !== 2) throw new Error("Brands not found");

    const a = brands.find((b: any) => b.id === brandAId)!;
    const b = brands.find((b: any) => b.id === brandBId)!;

    const prompt = `Predict the winner of a head-to-head brand battle.
Brand A: ${a.name} (${a.category}, tier: ${a.tier}, votes: ${a.total_votes})
Brand B: ${b.name} (${b.category}, tier: ${b.tier}, votes: ${b.total_votes})

Output strictly via the predict_winner tool.`;

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a brand prediction engine. Be decisive." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "predict_winner",
            description: "Pick the winning brand and explain.",
            parameters: {
              type: "object",
              properties: {
                winner: { type: "string", enum: [a.name, b.name] },
                confidence: { type: "number", description: "0-100" },
                reasoning: { type: "string", description: "2-3 sentences why." },
                key_factors: { type: "array", items: { type: "string" } },
              },
              required: ["winner", "confidence", "reasoning", "key_factors"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "predict_winner" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Wait a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI error " + aiResp.status);
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : null;
    if (!args) throw new Error("No prediction returned");

    const winnerId = args.winner === a.name ? a.id : b.id;

    await adminClient.from("brand_votes")
      .update({ purchased_votes: (votes.purchased_votes ?? 0) - COST })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({
      success: true,
      winnerId,
      winnerName: args.winner,
      confidence: args.confidence,
      reasoning: args.reasoning,
      keyFactors: args.key_factors,
      charged: COST,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("predictor error:", e);
    return new Response(JSON.stringify({ error: e.message ?? "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
