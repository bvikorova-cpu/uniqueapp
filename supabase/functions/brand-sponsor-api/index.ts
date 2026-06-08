// Brand Arena public REST API for Enterprise sponsors.
// Authenticated via `X-API-Key: ba_live_...` (issued on Stripe activation).
//
// Endpoints (action in query string or JSON body):
//   GET  ?action=me            → sponsor profile + subscription state
//   GET  ?action=votes&days=30 → daily vote series for last N days (max 90)
//   GET  ?action=rank          → current rank among active sponsors
//   GET  ?action=competitors   → top 10 in same category
//
// verify_jwt = false (the API key replaces the JWT). All access checks happen
// in this function against `brand_sponsors.api_key`.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const apiKey =
    req.headers.get("x-api-key") ||
    req.headers.get("X-API-Key") ||
    url.searchParams.get("api_key");

  if (!apiKey || !apiKey.startsWith("ba_live_")) {
    return json({ error: "missing_or_invalid_api_key" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const { data: keyRow, error: kErr } = await supabase
    .from("brand_sponsor_api_keys")
    .select("sponsor_id")
    .eq("api_key", apiKey)
    .maybeSingle();
  if (kErr || !keyRow) return json({ error: "invalid_api_key" }, 401);

  const { data: sponsor, error: sErr } = await supabase
    .from("brand_sponsors")
    .select("*")
    .eq("id", keyRow.sponsor_id)
    .maybeSingle();

  if (sErr || !sponsor) return json({ error: "sponsor_not_found" }, 401);
  if (sponsor.subscription_status !== "active") {
    return json({ error: "subscription_not_active", status: sponsor.subscription_status }, 402);
  }
  if (sponsor.tier !== "enterprise") {
    return json({ error: "api_access_requires_enterprise_tier" }, 403);
  }

  let action = url.searchParams.get("action");
  let body: any = {};
  if (!action && (req.method === "POST" || req.method === "PUT")) {
    try { body = await req.json(); action = body.action; } catch { /* noop */ }
  }
  action = action || "me";

  try {
    if (action === "me") {
      return json({ sponsor });
    }

    if (action === "votes") {
      const days = Math.min(90, Math.max(1, Number(url.searchParams.get("days") ?? body.days ?? 30)));
      const since = new Date(Date.now() - days * 86400_000).toISOString();
      const { data, error } = await supabase
        .from("brand_votes")
        .select("created_at")
        .eq("brand_id", sponsor.id)
        .gte("created_at", since);
      if (error) throw error;
      const byDate: Record<string, number> = {};
      (data ?? []).forEach((v: any) => {
        const d = new Date(v.created_at).toISOString().slice(0, 10);
        byDate[d] = (byDate[d] || 0) + 1;
      });
      return json({
        brand_id: sponsor.id,
        days,
        total: data?.length ?? 0,
        series: Object.entries(byDate)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, votes]) => ({ date, votes })),
      });
    }

    if (action === "rank") {
      const { data, error } = await supabase
        .from("brand_sponsors")
        .select("id,total_votes")
        .eq("subscription_status", "active")
        .eq("moderation_status", "approved")
        .order("total_votes", { ascending: false });
      if (error) throw error;
      const rank = (data ?? []).findIndex((s: any) => s.id === sponsor.id) + 1;
      return json({ rank: rank || null, total: data?.length ?? 0, total_votes: sponsor.total_votes });
    }

    if (action === "competitors") {
      const { data, error } = await supabase
        .from("brand_sponsors")
        .select("id,name,logo,tier,total_votes,category")
        .eq("category", sponsor.category)
        .eq("subscription_status", "active")
        .eq("moderation_status", "approved")
        .neq("id", sponsor.id)
        .order("total_votes", { ascending: false })
        .limit(10);
      if (error) throw error;
      return json({ category: sponsor.category, competitors: data ?? [] });
    }

    return json({ error: "unknown_action", valid: ["me", "votes", "rank", "competitors"] }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
