import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const { boxId } = await req.json();
    if (!boxId) throw new Error("Box ID is required");

    // Deduct 3 credits
    const { data: creditData } = await supabase.from("ai_credits").select("*").eq("user_id", user.id).maybeSingle();
    if (!creditData || creditData.credits_remaining < 3) throw new Error("Insufficient credits");
    await supabase.from("ai_credits").update({ credits_remaining: creditData.credits_remaining - 3 }).eq("user_id", user.id);

    // Get box info
    const { data: box } = await supabase.from("mystery_boxes").select("*").eq("id", boxId).single();
    const boxName = box?.name || "Mystery Box";

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You simulate mystery box openings for a digital collectibles platform. Generate 5 simulated results with varying rarities. Return JSON: { simulations: [{ itemName, category, rarity }] } where rarity is Common/Uncommon/Rare/Epic/Legendary." },
          { role: "user", content: `Simulate opening "${boxName}" (price: ${box?.price || 0} credits) 5 times. Weight rarities realistically — common items most frequent, legendary very rare.` }
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
