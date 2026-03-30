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

    // Deduct credits
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error("Invalid token");

    // Check credits
    const { data: credits } = await supabase.from("photo_credits").select("*").eq("user_id", user.id).single();
    if (!credits || credits.credits_remaining < 3) throw new Error("Insufficient credits. You need 3 credits for background removal.");

    // AI analysis
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Analyze this image for background removal. Describe the subject vs background, suggest the best masking approach, and describe what the result would look like with a transparent background. Return JSON: { processedImageUrl: '<original_url>', analysis: { subject: string, background: string, complexity: 'simple'|'moderate'|'complex', confidence: number } }" },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }],
        response_format: { type: "json_object" }
      })
    });

    const aiData = await aiResponse.json();
    const result = JSON.parse(aiData.choices[0].message.content);
    result.processedImageUrl = imageUrl;

    // Deduct credits
    await supabase.from("photo_credits").update({ credits_remaining: credits.credits_remaining - 3 }).eq("user_id", user.id);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
