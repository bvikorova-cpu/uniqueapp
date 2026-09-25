import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COST = 25;
// Any past encyclopedia purchase (PDF, translated PDF or e-book) unlocks online reading.
const OWNED_TYPES = ["kids_posters_encyclopedia", "kids_encyclopedia_translate", "kids_ebook_unlock"];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);
    const { data: authData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = authData.user;
    if (!user) return json({ error: "Not authenticated" }, 401);

    const { unlock } = await req.json().catch(() => ({ unlock: false }));

    const { count } = await supabase
      .from("ai_usage_history")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("usage_type", OWNED_TYPES);
    if ((count ?? 0) > 0) return json({ owned: true });
    if (!unlock) return json({ owned: false, cost: COST });

    const { data: credRow } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const balance = credRow?.credits_remaining ?? 0;
    if (balance < COST) return json({ error: "Insufficient credits", credits_remaining: balance, cost: COST }, 402);

    const { error: deductError } = await supabase.rpc("deduct_ai_credits", {
      p_user_id: user.id,
      p_amount: COST,
      p_reason: "kids_ebook_unlock",
      p_source: "kids_learning_posters",
    });
    if (deductError) {
      return json({ error: deductError.message, cost: COST }, /insufficient/i.test(deductError.message) ? 402 : 500);
    }

    await supabase.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: "kids_ebook_unlock",
      credits_used: COST,
      description: "Learning Encyclopedia e-book (online reading, all languages)",
    });

    return json({ owned: true, creditsRemaining: balance - COST });
  } catch (error) {
    console.error("kids-ebook-access error:", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
