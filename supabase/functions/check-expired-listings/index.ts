// Marks expired marketplace/job/property listings as inactive.
// Called by cron or manually from admin panel.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const now = new Date().toISOString();
    const results: Record<string, number> = {};

    for (const table of ["job_listings", "marketplace_items", "property_listings", "auction_listings"]) {
      const { count, error } = await supabase
        .from(table)
        .update({ status: "expired" })
        .lt("expires_at", now)
        .in("status", ["active", "pending"])
        .select("id", { count: "exact", head: true });
      if (!error) results[table] = count ?? 0;
    }

    return new Response(JSON.stringify({ success: true, expired: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
