// Public endpoint: given a referral code, returns the referrer's
// display name + avatar so the /auth?ref=CODE landing page can show
// "X invited you" social proof. No PII beyond what's already public.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const code = (url.searchParams.get("code") || "").trim();
    if (!code) return json({ error: "Missing code" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    let referrerId: string | null = null;
    const { data: codeRow } = await supabase
      .from("megatalent_referral_codes")
      .select("user_id")
      .eq("code", code)
      .maybeSingle();
    if (codeRow?.user_id) referrerId = codeRow.user_id;

    if (!referrerId && code.startsWith("UNIQ-")) {
      const prefix = code.slice(5).toLowerCase();
      const { data: prof } = await supabase
        .from("profiles").select("id").ilike("id", `${prefix}%`).limit(1).maybeSingle();
      if (prof?.id) referrerId = prof.id;
    }

    if (!referrerId) return json({ found: false }, 200);

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, username")
      .eq("id", referrerId)
      .maybeSingle();

    return json({
      found: true,
      full_name: profile?.full_name || profile?.username || "A friend",
      avatar_url: profile?.avatar_url || null,
    }, 200);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
