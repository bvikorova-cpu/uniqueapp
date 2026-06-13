// Marks expired property listings as inactive. Safe to call from client every 5 min.
// Idempotent — only updates rows whose expires_at < now() AND status != 'expired'.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Best-effort update. If schema/column doesn't exist yet, silently return ok.
    const { data, error } = await supabase
      .from("property_listings")
      .update({ status: "expired" })
      .lt("expires_at", new Date().toISOString())
      .neq("status", "expired")
      .select("id");

    if (error) {
      console.warn("[check-expired-listings] update skipped:", error.message);
      return new Response(JSON.stringify({ ok: true, expired: 0, note: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, expired: data?.length ?? 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // never 500 — runs from useEffect interval
    });
  }
});
