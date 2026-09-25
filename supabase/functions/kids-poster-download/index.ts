import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const COST = 1;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);
    const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { data: authData } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = authData.user;
    if (!user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const posterId = typeof body.posterId === "string" ? body.posterId.replace(/[^a-z0-9-]/gi, "").slice(0, 80) : "";
    if (!posterId) return json({ error: "Invalid poster" }, 400);

    const { data: creditRow, error: creditError } = await admin.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (creditError) return json({ error: creditError.message }, 500);
    const balance = creditRow?.credits_remaining ?? 0;
    if (balance < COST) return json({ error: "Insufficient credits", creditsRemaining: balance, cost: COST }, 402);

    const { error: deductError } = await admin.rpc("deduct_ai_credits", {
      p_user_id: user.id,
      p_amount: COST,
      p_reason: "kids_poster_download",
      p_source: "kids_learning_posters",
    });
    if (deductError) return json({ error: deductError.message }, /insufficient/i.test(deductError.message) ? 402 : 500);

    await admin.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: "kids_poster_download",
      credits_used: COST,
      description: `Learning poster download: ${posterId}`,
    });
    return json({ success: true, creditsRemaining: balance - COST, cost: COST });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
