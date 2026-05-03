// Past Life Reading edge function.
// Aliased from "analyze-past-life" via patchSupabaseFunctions.ts.
//
// Honors readingType (basic=1 life/5cr, full=3 lives/15cr, soulmate=3+partner/20cr),
// deducts from past_life_credits, writes to past_life_readings, and returns
// { reading: { pastLives, overallKarmicTheme, soulmateConnection } } matching the UI.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COSTS: Record<string, number> = { basic: 5, full: 15, soulmate: 20 };
const LIVES_COUNT: Record<string, number> = { basic: 1, full: 3, soulmate: 3 };

interface RequestBody {
  birthDate: string;
  dreamsDejavu?: string;
  talentsPhobias?: string;
  readingType: string;
  partnerBirthDate?: string;
  partnerInfo?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");

    const supabaseAuth = createClient(supabaseUrl, anonKey);
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userData.user) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }
    const user = userData.user;

    const body = (await req.json().catch(() => ({}))) as Partial<RequestBody>;
    const readingType = (body.readingType ?? "full").toLowerCase();
    if (!COSTS[readingType]) {
      return jsonResponse({ error: "Invalid readingType. Must be basic, full, or soulmate." }, 400);
    }
    if (!body.birthDate) {
      return jsonResponse({ error: "birthDate is required" }, 400);
    }
    if (readingType === "soulmate" && !body.partnerBirthDate) {
      return jsonResponse({ error: "partnerBirthDate is required for soulmate readings" }, 400);
    }

    const cost = COSTS[readingType];
    const livesCount = LIVES_COUNT[readingType];

    // Service-role client for credit deduction + insertion (bypass RLS for reliable writes).
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Ensure credits row exists, then check balance.
    const { data: creditsRow } = await supabaseAdmin
      .from("past_life_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    const currentCredits = creditsRow?.credits_remaining ?? 0;
    if (currentCredits < cost) {
      return jsonResponse({ requiresPayment: true, error: "Insufficient credits", needed: cost, balance: currentCredits }, 402);
    }

    // Generate the AI reading.
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return jsonResponse({ error: "OPENAI_API_KEY not configured" }, 500);
    }

    const userContext = [
      `Birth date: ${body.birthDate}`,
      body.dreamsDejavu ? `Dreams / déjà vu: ${body.dreamsDejavu}` : "",
      body.talentsPhobias ? `Talents / phobias: ${body.talentsPhobias}` : "",
    ].filter(Boolean).join("\n");

    const partnerContext = readingType === "soulmate"
      ? `\nPartner birth date: ${body.partnerBirthDate}\n${body.partnerInfo ? `About partner: ${body.partnerInfo}` : ""}`
      : "";

    const systemPrompt = `You are a mystical past life regression expert. Generate vivid, historically rich past life readings.
Return ONLY valid JSON with this exact structure (no markdown):
{
  "pastLives": [
    {
      "period": "specific historical era with year range",
      "location": "specific city/region/country",
      "profession": "specific role/profession",
      "name": "historically appropriate name",
      "story": "4-6 sentence vivid narrative",
      "karmicLesson": "the lesson this life teaches the soul today"
    }
  ],
  "overallKarmicTheme": "2-3 paragraph synthesis of the soul's journey across these lives, written in second person",
  "soulmateConnection": ${readingType === "soulmate" ? '"2-3 paragraph analysis of past life connections with the partner, shared lifetimes, and karmic patterns in the current relationship"' : "null"}
}
Generate exactly ${livesCount} past ${livesCount === 1 ? "life" : "lives"}. Make each completely unique across different eras and continents.`;

    const userPrompt = `Generate a unique past life reading.\n\n${userContext}${partnerContext}`;

    const aiUrl = "https://api.openai.com/v1/chat/completions";
    const aiKey = openaiKey;
    const model = "gpt-4o-mini";

    const aiResponse = await fetch(aiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${aiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return jsonResponse({ error: "Rate limited. Please try again in a moment." }, 429);
      }
      if (aiResponse.status === 402) {
        return jsonResponse({ error: "AI workspace credits exhausted." }, 402);
      }
      return jsonResponse({ error: "Failed to generate past life reading" }, 500);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content ?? "";
    const cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    let reading: { pastLives: any[]; overallKarmicTheme: string; soulmateConnection?: string | null };
    try {
      reading = JSON.parse(cleaned);
    } catch (e) {
      console.error("Parse failure:", cleaned.slice(0, 500));
      return jsonResponse({ error: "AI returned malformed data. Please retry." }, 500);
    }

    if (!Array.isArray(reading.pastLives) || reading.pastLives.length === 0) {
      return jsonResponse({ error: "AI did not produce any past lives." }, 500);
    }

    // Persist to past_life_readings (matches PastLifeHistory.tsx).
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("past_life_readings")
      .insert({
        user_id: user.id,
        birth_date: body.birthDate,
        dreams_dejavu: body.dreamsDejavu ?? null,
        talents_phobias: body.talentsPhobias ?? null,
        reading_type: readingType,
        credits_used: cost,
        past_lives: reading.pastLives,
        karmic_lessons: reading.overallKarmicTheme ?? null,
        soulmate_analysis: reading.soulmateConnection ?? null,
        partner_birth_date: body.partnerBirthDate ?? null,
        partner_info: body.partnerInfo ?? null,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Insert failed:", insertErr);
      return jsonResponse({ error: "Failed to save reading" }, 500);
    }

    // Deduct credits AFTER successful save.
    const { error: deductErr } = await supabaseAdmin
      .from("past_life_credits")
      .update({ credits_remaining: currentCredits - cost, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (deductErr) {
      console.error("Deduct failed (reading still saved):", deductErr);
    }

    return jsonResponse({
      success: true,
      reading: {
        pastLives: reading.pastLives,
        overallKarmicTheme: reading.overallKarmicTheme,
        soulmateConnection: reading.soulmateConnection ?? undefined,
      },
      readingId: inserted.id,
      creditsRemaining: currentCredits - cost,
    }, 200);
  } catch (error: unknown) {
    console.error("Unhandled error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
