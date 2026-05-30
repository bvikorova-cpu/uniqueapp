import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader?.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error("Not authenticated");

    const { itemId, horseId } = await req.json();
    if (!itemId || !horseId) throw new Error("Item and horse required");

    const prices: Record<string, number> = {
      "racing-saddle": 200, "speed-horseshoes": 300, "stamina-feed": 150,
      "premium-saddle": 500, "golden-horseshoes": 800, "champion-armor": 1000,
    };

    const price = prices[itemId] || 250;

    const { data: currency } = await supabase
      .from("horse_racing_currency")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!currency || currency.balance < price) {
      throw new Error("Insufficient coins");
    }

    await supabase
      .from("horse_racing_currency")
      .update({ balance: currency.balance - price })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({
      success: true,
      itemId,
      horseId,
      price,
      message: `Equipment purchased for ${price} coins!`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
