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

    const { questId } = await req.json();
    if (!questId) throw new Error("Quest ID required");

    const reward = 100 + Math.floor(Math.random() * 200);

    // Add reward to horse currency
    const { data: currency } = await supabase
      .from("horse_racing_currency")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (currency) {
      await supabase
        .from("horse_racing_currency")
        .update({ balance: currency.balance + reward })
        .eq("user_id", user.id);
    }

    return new Response(JSON.stringify({
      success: true,
      reward,
      questId,
      message: `Quest reward claimed: ${reward} coins!`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
