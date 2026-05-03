import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COST = 15;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { destination } = await req.json();
    if (!destination || typeof destination !== "string") {
      return new Response(JSON.stringify({ error: "destination is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check & deduct credits
    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .single();

    if (!credits || credits.credits_remaining < COST) {
      return new Response(
        JSON.stringify({ error: `Insufficient credits. Need ${COST} credits.` }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Generate 4 panoramic scenes using Lovable AI Gateway
    const scenes = [
      `Stunning 360-degree panoramic view of ${destination}, golden hour, ultra wide, photorealistic`,
      `Iconic landmark of ${destination}, daytime, vibrant, photorealistic, ultra wide`,
      `Local street scene in ${destination}, atmospheric, cinematic, photorealistic`,
      `${destination} at night, neon lights, cinematic, photorealistic, ultra wide`,
    ];

    const imageUrls: string[] = [];
    for (const prompt of scenes) {
      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      });
      if (!aiResp.ok) {
        const t = await aiResp.text();
        console.error("AI gateway error:", aiResp.status, t);
        continue;
      }
      const aiData = await aiResp.json();
      const url = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (url) imageUrls.push(url);
    }

    if (imageUrls.length === 0) {
      return new Response(JSON.stringify({ error: "Failed to generate tour images" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduct credits
    await supabase
      .from("ai_credits")
      .update({
        credits_remaining: credits.credits_remaining - COST,
        last_used_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    // Save tour
    const { data: tour, error: insertError } = await supabase
      .from("virtual_tours")
      .insert({
        user_id: user.id,
        destination,
        description: `AI-generated 360° virtual tour of ${destination}`,
        image_urls: imageUrls,
        credits_used: COST,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    await supabase.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: "virtual_tour",
      credits_used: COST,
      description: `Virtual tour: ${destination}`,
    });

    return new Response(JSON.stringify({ tour, image_urls: imageUrls }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-virtual-tour error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
