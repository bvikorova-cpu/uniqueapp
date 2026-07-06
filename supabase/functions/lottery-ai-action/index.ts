import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";
import { spendAiCredits } from "../_shared/spendCredits.ts";

const Body = z.object({
  action: z.enum(["save-pick", "submit-ticket"]),
  game_type: z.string().min(1).max(50),
  numbers: z.array(z.number().int().min(1).max(99)).min(1).max(20),
  bonus_numbers: z.array(z.number().int().min(1).max(99)).max(10).optional(),
  label: z.string().max(100).optional(),
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

    const spend = await spendAiCredits(admin, userId, COST, `lottery_${parsed.data.action}`, "lottery-ai-action");
    if (!spend.ok) return new Response(JSON.stringify({ error: spend.error, requiresPayment: true }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data, error } = await admin.from("lottery_saved_picks").insert({
      user_id: userId,
      game_type: parsed.data.game_type,
      numbers: parsed.data.numbers,
      bonus_numbers: parsed.data.bonus_numbers ?? null,
      label: parsed.data.label ?? null,
      submitted: parsed.data.action === "submit-ticket",
    }).select().single();
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, pick: data, credits_remaining: spend.remaining }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
