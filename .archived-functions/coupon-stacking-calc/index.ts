// Coupon Stacking Calculator — uses Lovable AI Gateway. 3 credits per call.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });

    const { coupon_ids, cart_total } = await req.json();
    if (!Array.isArray(coupon_ids) || coupon_ids.length === 0) {
      return new Response(JSON.stringify({ error: "coupon_ids required" }), { status: 400, headers: corsHeaders });
    }

    // Charge 3 credits
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: credits } = await admin.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < 3) {
      return new Response(JSON.stringify({ error: "insufficient_credits" }), { status: 402, headers: corsHeaders });
    }
    await admin.from("ai_credits").update({ credits_remaining: credits.credits_remaining - 3, last_used_at: new Date().toISOString() }).eq("user_id", user.id);

    const { data: coupons } = await admin.rpc("coupon_stacking_check", { _ids: coupon_ids });

    const prompt = `You are a coupon stacking expert. Given these coupons: ${JSON.stringify(coupons)} and cart total ${cart_total ?? "unknown"} EUR, compute final price, identify conflicts (e.g. only one % discount allowed per order, gift cards stack with codes, BOGO can't combine with %), and return JSON: { final_price, total_savings, order: [coupon_id...], warnings: [string] }. Use EUR.`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")!}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });
    if (aiRes.status === 429) return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: corsHeaders });
    if (aiRes.status === 401 || aiRes.status === 402) return new Response(JSON.stringify({ error: "ai_credits_exhausted" }), { status: 402, headers: corsHeaders });
    const j = await aiRes.json();
    const content = j.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = { raw: content }; }

    return new Response(JSON.stringify({ result: parsed, coupons }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
