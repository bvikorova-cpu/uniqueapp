import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MONTHLY_AMOUNT = 10;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // first day of current month
    const now = new Date();
    const grantMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;

    let granted = 0;
    let skipped = 0;
    let processed = 0;
    let page = 1;
    const perPage = 1000;

    while (true) {
      const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page, perPage });
      if (listErr) throw listErr;
      const users = list?.users ?? [];
      if (users.length === 0) break;

      for (const u of users) {
        processed++;
        // log row first — UNIQUE(user_id, grant_month) prevents double grants
        const { error: logErr } = await supabase
          .from("monthly_credit_grants")
          .insert({ user_id: u.id, grant_month: grantMonth, credits_granted: MONTHLY_AMOUNT });
        if (logErr) {
          // duplicate => already granted this month
          skipped++;
          continue;
        }

        // upsert ai_credits
        const { data: row } = await supabase
          .from("ai_credits")
          .select("id, credits_remaining")
          .eq("user_id", u.id)
          .maybeSingle();

        if (row) {
          await supabase
            .from("ai_credits")
            .update({
              credits_remaining: (row.credits_remaining ?? 0) + MONTHLY_AMOUNT,
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.id);
        } else {
          await supabase.from("ai_credits").insert({
            user_id: u.id,
            credits_remaining: MONTHLY_AMOUNT,
            total_credits_purchased: 0,
          });
        }
        granted++;
      }

      if (users.length < perPage) break;
      page++;
    }

    return new Response(
      JSON.stringify({ ok: true, grantMonth, processed, granted, skipped }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e) {
    console.error("monthly-credits-grant error", e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
