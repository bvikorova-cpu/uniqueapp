// Returns teen-career generation quota usage for current user.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FREE_LIMIT = 1;
const PRO_LIMIT = 25;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ used: 0, limit: FREE_LIMIT, can_generate: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const { data: userData } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    const userId = userData.user?.id;
    if (!userId) return new Response(JSON.stringify({ used: 0, limit: FREE_LIMIT, can_generate: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Check active subscription via universal check-subscription
    const subRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/check-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth, apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "" },
      body: JSON.stringify({ tier: "teen_career" }),
    });
    const sub = await subRes.json().catch(() => ({ subscribed: false }));
    const limit = sub.subscribed ? PRO_LIMIT : FREE_LIMIT;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("teen_career_generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart.toISOString());

    const used = count ?? 0;
    return new Response(JSON.stringify({ used, limit, can_generate: used < limit, subscribed: sub.subscribed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ used: 0, limit: FREE_LIMIT, can_generate: true, error: e instanceof Error ? e.message : String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
