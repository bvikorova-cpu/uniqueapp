import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { dayId } = await req.json();

    // Get the chakra day
    const { data: day, error } = await supabase
      .from("crystal_chakra_days")
      .select("*")
      .eq("id", dayId)
      .eq("user_id", user.id)
      .single();

    if (error || !day) throw new Error("Day not found");

    // Check if already unlocked by date
    const today = new Date().toISOString().split("T")[0];
    if (day.unlock_date > today) {
      throw new Error("This day is not yet unlocked");
    }

    // If content already generated, return it
    if (day.content) {
      return new Response(JSON.stringify({ success: true, day }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate AI content for this chakra day
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("AI not configured");

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert chakra healing practitioner. Create detailed, personalized daily healing content.",
          },
          {
            role: "user",
            content: `Create Day ${day.day_number} of a 7-day Chakra Balancing Program focused on the ${day.chakra_name}.

Include:
1. **Morning Intention** (2-3 sentences)
2. **Understanding ${day.chakra_name}** - what it controls, signs of blockage, signs of balance
3. **Crystal Therapy** - which crystals to use, how to place them, duration
4. **Guided Meditation** (5-minute script with visualization)
5. **Affirmations** (5 powerful affirmations)
6. **Physical Exercises** (yoga poses or movements)
7. **Evening Reflection** - journaling prompts
8. **Progress Check** - what to notice

Make it practical and actionable.`,
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) throw new Error("AI generation failed");

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    // Get crystal recommendation
    const crystalMap: Record<string, string> = {
      "Root": "Red Jasper, Black Tourmaline, Hematite",
      "Sacral": "Carnelian, Orange Calcite, Tiger's Eye",
      "Solar Plexus": "Citrine, Yellow Jasper, Pyrite",
      "Heart": "Rose Quartz, Green Aventurine, Jade",
      "Throat": "Blue Lace Agate, Sodalite, Aquamarine",
      "Third Eye": "Amethyst, Lapis Lazuli, Fluorite",
      "Crown": "Clear Quartz, Selenite, Lepidolite",
    };

    const chakraKey = Object.keys(crystalMap).find(k => day.chakra_name.includes(k)) || "Root";

    // Update the day with generated content
    const { data: updated } = await supabase
      .from("crystal_chakra_days")
      .update({
        content,
        crystal_recommendation: crystalMap[chakraKey],
        is_unlocked: true,
      })
      .eq("id", dayId)
      .select()
      .single();

    return new Response(JSON.stringify({ success: true, day: updated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-chakra-day error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
