import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";
import { spendAiCredits } from "../_shared/spendCredits.ts";

const Body = z.object({
  action: z.enum(["buy-car", "join-race", "shop-purchase", "upgrade", "livery", "bet", "race-start"]),
  item_name: z.string().min(1).max(100).optional(),
  amount: z.number().int().min(1).max(50).optional(),
  metadata: z.record(z.unknown()).optional() });

// Unified AI-credit costs for the GP Racing Arena (paid-only model).
const COSTS: Record<string, number> = {
  "buy-car": 5,
  "join-race": 2,
  "shop-purchase": 3,
  "upgrade": 2,
  "livery": 1,
  "race-start": 1,
  "bet": 1 };

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
    const { action, amount } = parsed.data;

    // Bets are wagered directly in credits (1–50); everything else has a fixed cost.
    const cost = action === "bet" ? (amount ?? 1) : COSTS[action];

    const spend = await spendAiCredits(admin, userId, cost, `gp_racing_${action}`, "gp-racing-action");
    if (!spend.ok) return new Response(JSON.stringify({ error: spend.error, requiresPayment: true }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data, error } = await admin.from("gp_race_entries").insert({
      user_id: userId,
      action_type: action,
      item_name: parsed.data.item_name ?? null,
      metadata: parsed.data.metadata ?? {},
      credits_spent: cost }).select().single();
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, entry: data, credits_spent: cost, credits_remaining: spend.remaining }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
