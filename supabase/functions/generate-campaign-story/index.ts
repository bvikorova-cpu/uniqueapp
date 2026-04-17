import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STORY_COST = 5; // credits

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableKey) throw new Error("LOVABLE_API_KEY missing");

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json();
    const { campaignType, summary, tone = "emotional", goalAmount, beneficiaryName } = body;

    if (!summary || summary.length < 10) {
      return new Response(JSON.stringify({ error: "Provide at least a short summary (10+ chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check & deduct credits
    const { data: credits } = await adminClient
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", userId)
      .maybeSingle();

    if (!credits || credits.credits_remaining < STORY_COST) {
      return new Response(JSON.stringify({
        error: "insufficient_credits",
        message: `You need ${STORY_COST} credits to generate a story. You have ${credits?.credits_remaining ?? 0}.`,
        cost: STORY_COST,
      }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build prompt
    const toneMap: Record<string, string> = {
      emotional: "deeply emotional, heartfelt, vulnerable but hopeful",
      hopeful: "uplifting, hopeful, focusing on the positive impact donors will make",
      urgent: "urgent and time-sensitive while remaining respectful and dignified",
      grateful: "warm, grateful, focused on community and gratitude",
      inspiring: "inspiring, motivational, focusing on resilience and overcoming odds",
    };

    const systemPrompt = `You are a world-class fundraising copywriter. You write campaign stories that convert visitors into donors. Write in English. Be respectful, dignified, never manipulative. Keep cultural sensitivity in mind.`;

    const userPrompt = `Write a compelling fundraising campaign for the following:

Campaign category: ${campaignType}
${beneficiaryName ? `Beneficiary: ${beneficiaryName}` : ""}
${goalAmount ? `Goal amount: €${goalAmount}` : ""}
Tone: ${toneMap[tone] || toneMap.emotional}

Brief from author: """${summary}"""

Return JSON with EXACTLY these keys:
- "title": A short, powerful campaign title (max 70 chars)
- "story": A full campaign story, 4–6 paragraphs, written in second person addressing potential donors. Open with an emotional hook, give context, explain what the funds will do, and end with a clear call to action. ${tone === "urgent" ? "Convey urgency without being pushy." : ""}
- "appeal": A 1-sentence donation appeal (max 140 chars)`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_story",
            description: "Submit the generated campaign story",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                story: { type: "string" },
                appeal: { type: "string" },
              },
              required: ["title", "story", "appeal"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "submit_story" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI service requires top-up. Please contact support." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiRes.text();
      console.error("AI error:", aiRes.status, t);
      throw new Error("AI generation failed");
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");
    const parsed = JSON.parse(toolCall.function.arguments);

    // Deduct credits
    await adminClient
      .from("ai_credits")
      .update({
        credits_remaining: credits.credits_remaining - STORY_COST,
        last_used_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    // Log generation
    await adminClient.from("ai_story_generations").insert({
      user_id: userId,
      campaign_type: campaignType,
      input_summary: summary,
      generated_story: parsed.story,
      generated_title: parsed.title,
      tone,
      credits_used: STORY_COST,
    });

    return new Response(JSON.stringify({
      success: true,
      title: parsed.title,
      story: parsed.story,
      appeal: parsed.appeal,
      credits_used: STORY_COST,
      credits_remaining: credits.credits_remaining - STORY_COST,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("generate-campaign-story error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
