// Public read-only Coupon API. Auth via X-API-Key header (hashed match).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) return new Response(JSON.stringify({ error: "missing_api_key" }), { status: 401, headers: corsHeaders });
    const hash = await sha256(apiKey);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: keyRow } = await admin.from("coupon_api_keys").select("*").eq("key_hash", hash).eq("revoked", false).maybeSingle();
    if (!keyRow) return new Response(JSON.stringify({ error: "invalid_api_key" }), { status: 401, headers: corsHeaders });
    await admin.from("coupon_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyRow.id);

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);
    const category = url.searchParams.get("category");
    let q = admin.from("coupon_listings").select("id,title,store_name,selling_price,original_value,category,coupon_type,expiry_date,created_at").eq("is_sold", false).order("created_at", { ascending: false }).limit(limit);
    if (category) q = q.eq("category", category);
    const { data } = await q;

    return new Response(JSON.stringify({ data, count: data?.length ?? 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
