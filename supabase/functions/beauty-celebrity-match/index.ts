import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { imageUrl, gender, style } = await req.json();
    if (!imageUrl) throw new Error("Image URL is required");

    const { data: credits } = await supabase
      .from("ai_credits").select("credits_remaining").eq("user_id", user.id).single();

    if (!credits || credits.credits_remaining < 10) {
      throw new Error("Insufficient credits. You need 10 credits for celebrity match.");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a celebrity beauty and style expert. Analyze photos and match with celebrities based on facial features, style, and overall aesthetic. Return JSON." },
          {
            role: "user",
            content: `Based on a ${gender || "person"}'s photo with ${style || "natural"} style preferences, provide a celebrity look match analysis.

Return JSON:
{
  "topMatch": {
    "celebrity": "Celebrity Name",
    "similarityScore": 85,
    "matchReasons": ["similar jawline", "eye shape", "skin tone"],
    "signatureLook": "Description of their iconic look"
  },
  "alternativeMatches": [
    {"celebrity": "Name", "similarityScore": 75, "matchReason": "reason"},
    {"celebrity": "Name", "similarityScore": 70, "matchReason": "reason"}
  ],
  "lookRecreation": {
    "overview": "How to recreate their signature look",
    "steps": [
      {"step": 1, "area": "Base/Foundation", "technique": "description", "products": ["product1"]},
      {"step": 2, "area": "Eyes", "technique": "description", "products": ["product1"]},
      {"step": 3, "area": "Lips", "technique": "description", "products": ["product1"]},
      {"step": 4, "area": "Contour/Highlight", "technique": "description", "products": ["product1"]},
      {"step": 5, "area": "Hair", "technique": "description", "products": ["product1"]}
    ]
  },
  "productList": [
    {"product": "name", "brand": "brand", "category": "foundation/lipstick/etc", "priceRange": "$X-$Y", "dupe": "affordable alternative"}
  ],
  "styleNotes": ["tip1", "tip2"]
}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const aiData = await response.json();
    const matchResult = JSON.parse(aiData.choices[0].message.content);

    await supabase.from("ai_credits").update({
      credits_remaining: credits.credits_remaining - 10,
      last_used_at: new Date().toISOString()
    }).eq("user_id", user.id);

    await supabase.from("beauty_celebrity_matches").insert({
      user_id: user.id, image_url: imageUrl,
      celebrity_name: matchResult.topMatch?.celebrity,
      similarity_score: matchResult.topMatch?.similarityScore,
      look_recreation: JSON.stringify(matchResult.lookRecreation),
      products_needed: matchResult.productList,
      credits_used: 10
    });

    await supabase.from("ai_usage_history").insert({
      user_id: user.id, usage_type: "beauty_celebrity_match", credits_used: 10,
      description: `Celebrity match analysis`
    });

    return new Response(JSON.stringify({ matchResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
