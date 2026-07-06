import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";
import { spendAiCredits } from "../_shared/spendCredits.ts";

const Body = z.object({
  action: z.enum(["place-trade", "write-journal"]),
  phobia_symbol: z.string().min(1).max(50).optional(),
  direction: z.enum(["long", "short"]).optional(),
  amount: z.number().positive().max(1_000_000).optional(),
  journal_entry: z.string().max(4000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const COST = 2;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(supabaseUrl, serviceKey);
    const userId = userData.user.id;

    const spend = await spendAiCredits(admin, userId, COST, `phobia_${parsed.data.action}`, "phobia-trading-action");
    if (!spend.ok) return new Response(JSON.stringify({ error: spend.error, requiresPayment: true }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data, error } = await admin.from("phobia_trade_actions").insert({
      user_id: userId,
      action_type: parsed.data.action,
      phobia_symbol: parsed.data.phobia_symbol ?? null,
      direction: parsed.data.direction ?? null,
      amount: parsed.data.amount ?? null,
      journal_entry: parsed.data.journal_entry ?? null,
      metadata: parsed.data.metadata ?? {},
      credits_spent: COST,
    }).select().single();
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, entry: data, credits_remaining: spend.remaining }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
