// Buys a Clone Battle power-up with AI credits. Server-side only so balances cannot be faked.
import { createClient } from "npm:@supabase/supabase-js@2";
import { CLONE_POWERUPS, findPowerup } from "../_shared/clonePowerups.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const j = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return j({ error: "No auth" }, 401);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return j({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    if (body?.action === "catalog") return j({ catalog: CLONE_POWERUPS });

    const key = typeof body?.powerupKey === "string" ? body.powerupKey : "";
    const qty = Math.min(Math.max(Number(body?.quantity ?? 1) || 1, 1), 10);
    const powerup = findPowerup(key);
    if (!powerup) return j({ error: "Unknown power-up" }, 400);

    const cost = powerup.cost * qty;
    const { data: deduct, error: deductError } = await admin.rpc("deduct_ai_credits_atomic", {
      _user_id: user.id,
      _amount: cost,
    });
    if (deductError) return j({ error: deductError.message }, 500);
    if (deduct && (deduct as any).ok === false) {
      return j({ error: `Not enough credits. ${powerup.name} x${qty} costs ${cost} credits.` }, 402);
    }

    const { data: existing } = await admin
      .from("clone_battle_powerups")
      .select("id, quantity, total_purchased")
      .eq("user_id", user.id)
      .eq("powerup_key", key)
      .maybeSingle();

    if (existing) {
      const { error } = await admin
        .from("clone_battle_powerups")
        .update({
          quantity: existing.quantity + qty,
          total_purchased: existing.total_purchased + qty,
        })
        .eq("id", existing.id);
      if (error) return j({ error: error.message }, 500);
    } else {
      const { error } = await admin.from("clone_battle_powerups").insert({
        user_id: user.id,
        powerup_key: key,
        quantity: qty,
        total_purchased: qty,
      });
      if (error) return j({ error: error.message }, 500);
    }

    return j({ ok: true, powerupKey: key, purchased: qty, creditsSpent: cost });
  } catch (e) {
    return j({ error: (e as Error).message ?? "Purchase failed" }, 500);
  }
});
