// Coupon Receipt Cashback — uploads URL, AI extracts items, posts pending cashback row. 5 credits.
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
    const { data: ud } = await supabase.auth.getUser();
    const user = ud.user;
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });

    const { receipt_url, coupon_id } = await req.json();
    if (!receipt_url) return new Response(JSON.stringify({ error: "receipt_url required" }), { status: 400, headers: corsHeaders });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: credits } = await admin.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < 5) {
      return new Response(JSON.stringify({ error: "insufficient_credits" }), { status: 402, headers: corsHeaders });
    }
    await admin.from("ai_credits").update({ credits_remaining: credits.credits_remaining - 5, last_used_at: new Date().toISOString() }).eq("user_id", user.id);

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")!}` },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Extract from this receipt: store_name, total_amount (EUR), date, item_count. Return JSON only." },
            { type: "image_url", image_url: { url: receipt_url } },
          ],
        }],
        response_format: { type: "json_object" },
      }),
    });
    if (aiRes.status === 429) return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: corsHeaders });
    if (aiRes.status === 401 || aiRes.status === 402) return new Response(JSON.stringify({ error: "ai_credits_exhausted" }), { status: 402, headers: corsHeaders });
    const j = await aiRes.json();
    let extracted: any = {};
    try { extracted = JSON.parse(j.choices?.[0]?.message?.content ?? "{}"); } catch {}

    const total = Number(extracted.total_amount ?? 0);
    const rate = 0.02; // 2% default
    const cashback = +(total * rate).toFixed(2);

    const { data: row, error } = await admin.from("coupon_cashback_ledger").insert({
      user_id: user.id,
      coupon_id: coupon_id ?? null,
      receipt_url,
      store_name: extracted.store_name ?? null,
      receipt_total: total,
      cashback_amount: cashback,
      cashback_rate: rate,
      status: "pending",
      ai_extracted: extracted,
    }).select().single();
    if (error) throw error;

    return new Response(JSON.stringify({ row, extracted, cashback }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
