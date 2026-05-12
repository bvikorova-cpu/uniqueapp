// Public stats for AI Pet Translator hero (no auth required).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

    const { count: translations } = await supabase
      .from("ai_usage_history")
      .select("id", { count: "exact", head: true })
      .like("usage_type", "pet_%");

    const { data: userRows } = await supabase
      .from("ai_usage_history")
      .select("user_id")
      .like("usage_type", "pet_%")
      .limit(10000);

    const uniqueUsers = new Set((userRows ?? []).map((r) => r.user_id)).size;

    return new Response(
      JSON.stringify({
        total_translations: translations ?? 0,
        total_users: uniqueUsers,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
