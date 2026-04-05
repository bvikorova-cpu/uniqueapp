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

    const { seasonId, horseId } = await req.json();
    if (!seasonId || !horseId) throw new Error("Season and horse required");

    // Deduct entry fee from horse currency
    const { data: currency } = await supabase
      .from("horse_racing_currency")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const entryFee = 500;
    if (!currency || currency.balance < entryFee) {
      throw new Error("Insufficient coins for championship entry");
    }

    await supabase
      .from("horse_racing_currency")
      .update({ balance: currency.balance - entryFee })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({
      success: true,
      message: "Successfully enrolled in championship",
      seasonId,
      horseId,
      entryFee,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
