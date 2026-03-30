import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const { imageUrl } = await req.json();
    if (!imageUrl) throw new Error("Image URL required");

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error("Invalid token");

    const { data: credits } = await supabase.from("photo_credits").select("*").eq("user_id", user.id).single();
    if (!credits || credits.credits_remaining < 5) throw new Error("Insufficient credits. You need 5 credits for face enhancement.");

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Analyze this photo for face enhancement. Detect all faces, assess quality of each face, and provide enhancement recommendations. Return JSON: { enhancedImageUrl: '<original_url>', analysis: { facesDetected: number, qualityScore: string, enhancementLevel: string, description: string, recommendations: string[] } }" },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }],
        response_format: { type: "json_object" }
      })
    });

    const aiData = await aiResponse.json();
    const result = JSON.parse(aiData.choices[0].message.content);
    result.enhancedImageUrl = imageUrl;

    await supabase.from("photo_credits").update({ credits_remaining: credits.credits_remaining - 5 }).eq("user_id", user.id);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
