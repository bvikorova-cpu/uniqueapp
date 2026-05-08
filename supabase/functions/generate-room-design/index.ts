import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const __auth = await requireAiCredits(req, corsHeaders, { credits: 5, usageType: "room_design" });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { style, roomDescription } = await req.json();
    if (!style) throw new Error("Style is required");

    // Check subscription and usage
    const { data: subscription } = await supabaseClient
      .from("decor_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!subscription || subscription.status !== "active") {
      return new Response(JSON.stringify({ error: "Active subscription required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    if (subscription.designs_used >= subscription.designs_limit) {
      return new Response(JSON.stringify({ error: "Design limit reached for this month" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Generate AI design using OpenAI
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const systemPrompt = "You are an expert interior designer specializing in various design styles. Provide detailed, actionable design recommendations.";

    const aiPrompt = `Create a beautiful ${style} style room design suggestion. ${roomDescription ? `Room details: ${roomDescription}` : ''}
    
    Provide specific recommendations for:
    1. Color palette (3-5 colors)
    2. Furniture pieces (5-7 items with descriptions)
    3. Decorative elements (5-7 items)
    4. Lighting suggestions
    5. Material recommendations
    
    Format the response as a structured design plan.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: aiPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "AI service rate limited. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("OpenAI API error");
    }

    const aiData = await response.json();
    const designSuggestion = aiData.choices[0].message.content;

    // Save design to database
    const { data: design } = await supabaseClient
      .from("ai_room_designs")
      .insert({
        user_id: user.id,
        room_image_url: "placeholder",
        style: style,
        ai_design_url: designSuggestion,
        is_saved: true,
      })
      .select()
      .single();

    // Increment designs used
    await supabaseClient
      .from("decor_subscriptions")
      .update({ designs_used: subscription.designs_used + 1 })
      .eq("user_id", user.id);

    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(JSON.stringify({ 
      design: designSuggestion,
      designs_remaining: subscription.designs_limit - subscription.designs_used - 1,
      design_id: design?.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Generate room design error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
