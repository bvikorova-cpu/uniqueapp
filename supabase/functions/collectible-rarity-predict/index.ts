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
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const { itemName, itemDescription } = await req.json();
    if (!itemName) throw new Error("Item name is required");

    // Deduct credits
    const { data: creditData } = await supabase.from("ai_credits").select("*").eq("user_id", user.id).maybeSingle();
    if (!creditData || creditData.credits_remaining < 8) throw new Error("Insufficient credits");
    await supabase.from("ai_credits").update({ credits_remaining: creditData.credits_remaining - 8 }).eq("user_id", user.id);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an AI collectibles expert. Analyze digital collectible items and predict their rarity trajectory, future value, and market demand. Return JSON with fields: currentRarity, predictedRarity, valueEstimate, analysis, investmentTip." },
          { role: "user", content: `Analyze this collectible:\nName: ${itemName}\nDescription: ${itemDescription || "No description provided"}` }
        ],
        response_format: { type: "json_object" }
      })
    });

    const aiData = await response.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
