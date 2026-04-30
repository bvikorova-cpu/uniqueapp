// Kids Science Lab — AI experiment analysis (paid-only, 4 science_credits per call)
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CREDITS_PER_RUN = 4;

const VALID_CATEGORIES = new Set(["physics", "chemistry", "biology", "earth", "astronomy"]);
const VALID_DIFFICULTIES = new Set(["young", "explorer", "researcher"]);

function jsonResp(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResp({ error: "Not authenticated" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claimsData?.claims) {
      return jsonResp({ error: "Not authenticated" }, 401);
    }
    const userId = claimsData.claims.sub as string;

    // Validate input
    const body = await req.json().catch(() => ({}));
    const category = String(body.category || "").trim().toLowerCase();
    const hypothesis = String(body.hypothesis || "").trim();
    const observations = String(body.observations || "").trim();
    const difficulty = String(body.difficulty || "explorer").trim().toLowerCase();

    if (!VALID_CATEGORIES.has(category)) {
      return jsonResp({ error: "Invalid category" }, 400);
    }
    if (hypothesis.length < 5 || hypothesis.length > 1000) {
      return jsonResp({ error: "Hypothesis must be 5–1000 chars" }, 400);
    }
    if (observations.length < 5 || observations.length > 2000) {
      return jsonResp({ error: "Observations must be 5–2000 chars" }, 400);
    }
    const safeDifficulty = VALID_DIFFICULTIES.has(difficulty) ? difficulty : "explorer";

    // Check & reserve credits
    const { data: creditRow } = await supabase
      .from("science_credits")
      .select("credits_remaining")
      .eq("user_id", userId)
      .maybeSingle();

    const remaining = creditRow?.credits_remaining ?? 0;
    if (remaining < CREDITS_PER_RUN) {
      return jsonResp(
        {
          error: `Not enough Science credits. Need ${CREDITS_PER_RUN}, have ${remaining}.`,
          creditsRemaining: remaining,
          creditsRequired: CREDITS_PER_RUN,
        },
        402,
      );
    }

    // Call Lovable AI Gateway
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return jsonResp({ error: "AI gateway not configured" }, 500);
    }

    const ageHint =
      safeDifficulty === "young"
        ? "ages 6–8, very simple words, short sentences, lots of analogies"
        : safeDifficulty === "researcher"
        ? "ages 11–12, slightly more technical vocabulary, can introduce real scientific terms with brief definitions"
        : "ages 9–10, friendly and clear, simple definitions for any technical term";

    const systemPrompt = `You are a friendly science teacher for kids. Always answer in the same language as the user input. Audience: ${ageHint}. Never recommend dangerous procedures. Always remind that real experiments need adult supervision when relevant.`;

    const userPrompt = `A child completed a ${category} experiment.

Hypothesis: ${hypothesis}
Observations: ${observations}

Analyze the experiment. Return a kind, encouraging conclusion (1–2 sentences), a clear scientific explanation (2–4 sentences), and exactly 3 short fun facts related to the topic.`;

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_analysis",
              description: "Return the experiment analysis.",
              parameters: {
                type: "object",
                properties: {
                  conclusion: { type: "string" },
                  explanation: { type: "string" },
                  funFacts: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3,
                  },
                },
                required: ["conclusion", "explanation", "funFacts"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_analysis" } },
      }),
    });

    if (aiResp.status === 429) {
      return jsonResp({ error: "Rate limit exceeded, please try again later." }, 429);
    }
    if (aiResp.status === 402) {
      return jsonResp({ error: "AI credits exhausted on the gateway. Please contact support." }, 402);
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      return jsonResp({ error: "AI gateway error" }, 500);
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in AI response", JSON.stringify(aiJson));
      return jsonResp({ error: "AI returned no analysis. Please try again." }, 500);
    }

    let parsed: { conclusion: string; explanation: string; funFacts: string[] };
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Failed to parse AI tool args", e);
      return jsonResp({ error: "AI returned invalid format. Please try again." }, 500);
    }

    if (!parsed.conclusion || !parsed.explanation || !Array.isArray(parsed.funFacts) || parsed.funFacts.length === 0) {
      return jsonResp({ error: "AI returned incomplete analysis. Please try again." }, 500);
    }

    // Deduct credits AFTER successful generation (use service role to bypass RLS update race)
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const adminClient = createClient(supabaseUrl, serviceRole);
    await adminClient
      .from("science_credits")
      .update({
        credits_remaining: remaining - CREDITS_PER_RUN,
        last_used_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    await adminClient.from("ai_usage_history").insert({
      user_id: userId,
      usage_type: "science_lab",
      credits_used: CREDITS_PER_RUN,
      description: `Science Lab analysis (${category}, ${safeDifficulty})`,
    });

    return jsonResp({
      conclusion: parsed.conclusion,
      explanation: parsed.explanation,
      funFacts: parsed.funFacts,
      creditsRemaining: remaining - CREDITS_PER_RUN,
    });
  } catch (e) {
    console.error("kids-science-lab error", e);
    return jsonResp({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
