import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const toolPrompts: Record<string, string> = {
  scanner: "You are a crystal identification expert. Analyze this crystal photo and identify: crystal name, type, color, estimated value range in EUR, healing properties, chakra association, geological origin, Mohs hardness, and care tips. Format with clear sections.",
  aura: "You are an aura reading expert. Analyze this person's photo and describe: dominant aura colors (with percentages), energy blocks detected, overall aura strength (1-100), emotional state indicators, recommended crystals for aura cleansing, and personalized guidance for energy balance.",
  "live-id": "You are a crystal identification expert. Identify this crystal from the image. Provide: exact name, mineral family, color variations, rarity rating (Common/Uncommon/Rare/Very Rare), estimated value range in EUR, healing applications, and best practices for use.",
  healing: "You are an energy healing practitioner with deep crystal knowledge. Based on the user's description, create a comprehensive healing plan including: diagnosis of energy imbalances, 5 recommended crystals with placement instructions, daily meditation routine, affirmations, dietary suggestions, and a 7-day healing schedule.",
  compatibility: "You are a crystal compatibility and energy matching expert. Given descriptions of two people, analyze: overall compatibility score (1-100), shared energy frequencies, potential friction points, 5 recommended pair crystals, relationship enhancement rituals, and communication tips based on energy types.",
  "third-eye": "You are a spiritual development guide specializing in third eye activation. Based on the user's experience level, create a personalized exercise: step-by-step visualization instructions (10+ steps), recommended crystals to hold during practice, optimal duration, breathing pattern, expected sensations and signs of progress, and safety precautions.",
  oracle: "You are a crystal oracle channeler. For the given crystal, provide: a powerful daily mantra (1 sentence), detailed spiritual guidance for today (3-4 sentences), energy focus areas, complementary crystals, and a brief meditation instruction.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Authentication failed");

    const { toolType, imageUrl, textInput } = await req.json();
    if (!toolType) throw new Error("toolType is required");

    const systemPrompt = toolPrompts[toolType] || "You are a crystal healing AI assistant. Provide helpful, detailed guidance.";
    const messages: any[] = [{ role: "system", content: systemPrompt }];

    if (imageUrl) {
      messages.push({
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageUrl } },
          { type: "text", text: textInput || "Please analyze this image in detail." }
        ]
      });
    } else {
      messages.push({ role: "user", content: textInput || "Please provide guidance." });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "AI request failed");
    const analysis = data.choices[0].message.content;

    // Save reading to history
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await adminClient.from("crystal_energy_readings").insert({
      user_id: user.id,
      tool_type: toolType,
      analysis_text: analysis,
      image_url: imageUrl || null,
      metadata: { textInput },
    });

    // Update stats
    await adminClient.rpc("increment_crystal_stat", {
      p_user_id: user.id,
      p_stat: "readings",
      p_value: 1,
    });

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[crystal-ai-tool] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
