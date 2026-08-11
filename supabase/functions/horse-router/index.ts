// Universal horse router - consolidates 6 horse-* functions.
// Frontend calls remain unchanged via proxyMap.ts rewrite.
// CURRENCY: the Horse Racing arena runs 100% on the unified `ai_credits` pool.
// There are no coins and no gems anywhere in this module.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { checkTestMode } from "../_shared/testMode.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

const VALID_STATS = ["speed", "stamina", "acceleration", "temperament"] as const;

/** Credit costs (unified ai_credits pool). */
const COST_CREATE_HORSE = 10;
const COST_TRAINING = 2;
const COST_RACE_ENTRY = 1;
const COST_CHAMPIONSHIP = 5;
const STAT_INCREASE = 5;
const EQUIPMENT_CREDITS: Record<string, number> = {
  // legacy ids
  "racing-saddle": 4, "speed-horseshoes": 6, "stamina-feed": 3,
  "premium-saddle": 10, "golden-horseshoes": 16, "champion-armor": 20,
  // saddles
  saddle_leather: 3, saddle_carbon: 8, saddle_champion: 18, saddle_legendary: 40,
  // horseshoes
  shoe_iron: 2, shoe_titanium: 7, shoe_diamond: 16, shoe_mythic: 36,
  // bridles
  bridle_basic: 2, bridle_pro: 6, bridle_master: 14,
  // blankets
  blanket_wool: 3, blanket_silk: 7, blanket_champion: 16 };

const HORSE_ACTIONS = ["ping", "create", "train", "join_race", "purchase_equipment", "championship_enroll", "claim_quest_reward"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    // Health probe: no auth, no credits.
    const probe = req.method === "GET" ? {} : await req.clone().json().catch(() => ({}));
    if ((probe as any)?.action === "ping" || new URL(req.url).searchParams.get("action") === "ping") {
      return json({ ok: true, router: "horse-router", actions: HORSE_ACTIONS });
    }

    // Test-mode bypass: skips auth + DB writes, returns stub.
    const tm = checkTestMode(req);
    if (tm) {
      const tmBody = await req.json().catch(() => ({}));
      const tmAction = String((tmBody as any)?.action ?? "").trim();
      if (!HORSE_ACTIONS.includes(tmAction) || tmAction === "ping") {
        return json({ error: `Unknown horse action: ${tmAction}` }, 400);
      }
      return tm.stub(tmAction);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No auth" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    /** Current unified credit balance. */
    const balance = async (): Promise<number> => {
      const { data } = await admin.from("ai_credits")
        .select("credits_remaining").eq("user_id", user.id).maybeSingle();
      return data?.credits_remaining ?? 0;
    };

    /** Spend credits + write the ledger row. Returns an error response on failure. */
    const spend = async (amount: number, reason: string): Promise<Response | null> => {
      if (amount <= 0) return null;
      const have = await balance();
      if (have < amount) {
        return json({
          error: `Insufficient AI credits. Need ${amount}, have ${have}.`,
          creditsRequired: amount,
          creditsRemaining: have }, 402);
      }
      const { error } = await admin.rpc("deduct_ai_credits", {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: reason,
        p_source: "horse_racing" });
      if (error) return json({ error: "Credit deduction failed" }, 402);
      await admin.from("ai_usage_history").insert({ user_id: user.id,
        usage_type: "custom_generation",
        credits_used: amount,
        description: reason });
      return null;
    };

    /** Refund credits when the follow-up write fails. */
    const refund = async (amount: number, reason: string) => {
      if (amount <= 0) return;
      await admin.rpc("add_ai_credits", { p_user_id: user.id,
        p_amount: amount,
        p_reason: `refund:${reason}`,
        p_source: "auto_refund" });
    };

    const body = await req.json().catch(() => ({} as any));
    const action = String(body?.action ?? "").trim();

    switch (action) {
      case "create": {
        const name = String(body?.name ?? "").trim().slice(0, 60);
        const breed = String(body?.breed ?? "").trim().slice(0, 60);
        const color = String(body?.color ?? "").trim().slice(0, 40);
        if (!name || !breed || !color) return json({ error: "Missing fields" }, 400);

        const err = await spend(COST_CREATE_HORSE, "horse-racing:buy-horse");
        if (err) return err;

        const stats = { speed_stat: Math.floor(Math.random() * 30) + 40,
          stamina_stat: Math.floor(Math.random() * 30) + 40,
          acceleration_stat: Math.floor(Math.random() * 30) + 40,
          temperament_stat: Math.floor(Math.random() * 30) + 40 };
        const { data: horse, error: hErr } = await admin
          .from("horses")
          .insert({ user_id: user.id, name, breed, color, ...stats })
          .select().single();
        if (hErr) {
          await refund(COST_CREATE_HORSE, "horse-racing:buy-horse");
          throw hErr;
        }
        return json({ horse, creditsSpent: COST_CREATE_HORSE });
      }

      case "train": {
        const { horseId, statType } = body || {};
        if (!horseId || !VALID_STATS.includes(statType)) return json({ error: "Invalid input" }, 400);

        const { data: horse } = await admin.from("horses").select("*").eq("id", horseId).maybeSingle();
        if (!horse || horse.user_id !== user.id) return json({ error: "Horse not yours" }, 403);

        const err = await spend(COST_TRAINING, `horse-racing:train:${statType}`);
        if (err) return err;

        const statField = `${statType}_stat`;
        const newValue = Math.min((horse[statField] || 0) + STAT_INCREASE, 100);
        const newXP = (horse.experience || 0) + 10;
        const newLevel = Math.floor(newXP / 100) + 1;

        const { error: uErr } = await admin.from("horses")
          .update({ [statField]: newValue, experience: newXP, level: newLevel })
          .eq("id", horseId);
        if (uErr) {
          await refund(COST_TRAINING, "horse-racing:train");
          throw uErr;
        }
        return json({ statType, newValue, creditsSpent: COST_TRAINING });
      }

      case "join_race": {
        const { raceId, horseId, strategy } = body || {};
        if (!raceId || !horseId || !strategy) return json({ error: "Missing fields" }, 400);

        const { data: horse } = await admin.from("horses").select("user_id").eq("id", horseId).maybeSingle();
        if (!horse || horse.user_id !== user.id) return json({ error: "Horse not yours" }, 403);

        const { data: race } = await admin.from("races").select("status")
          .eq("id", raceId).maybeSingle();
        if (!race) return json({ error: "Race not found" }, 404);
        if (race.status !== "waiting") return json({ error: "Race not joinable" }, 400);

        const err = await spend(COST_RACE_ENTRY, "horse-racing:race-entry");
        if (err) return err;

        const { data: part, error: pErr } = await admin.from("race_participants")
          .insert({ race_id: raceId, horse_id: horseId, user_id: user.id, strategy })
          .select().single();
        if (pErr) {
          await refund(COST_RACE_ENTRY, "horse-racing:race-entry");
          const msg = pErr.message?.includes("race_participants_race_user_unique")
            ? "Already joined this race" : pErr.message;
          return json({ error: msg }, 400);
        }
        return json({ participant: part, creditsSpent: COST_RACE_ENTRY });
      }

      case "purchase_equipment": {
        const { itemId, horseId } = body || {};
        if (!itemId || !horseId) return json({ error: "Item and horse required" }, 400);
        const { data: owned } = await admin.from("horses").select("user_id").eq("id", horseId).maybeSingle();
        if (!owned || owned.user_id !== user.id) return json({ error: "Horse not yours" }, 403);

        const price = EQUIPMENT_CREDITS[String(itemId)] ?? 5;
        const err = await spend(price, `horse-racing:equipment:${itemId}`);
        if (err) return err;
        return json({ success: true, itemId, horseId, price, creditsSpent: price,
          message: `Equipment purchased for ${price} credits!` });
      }

      case "championship_enroll": {
        const { seasonId, horseId } = body || {};
        if (!seasonId || !horseId) return json({ error: "Season and horse required" }, 400);
        const { data: owned } = await admin.from("horses").select("user_id").eq("id", horseId).maybeSingle();
        if (!owned || owned.user_id !== user.id) return json({ error: "Horse not yours" }, 403);

        const err = await spend(COST_CHAMPIONSHIP, "horse-racing:championship-entry");
        if (err) return err;
        return json({ success: true, message: "Successfully enrolled in championship",
          seasonId, horseId, entryFee: COST_CHAMPIONSHIP, creditsSpent: COST_CHAMPIONSHIP });
      }

      case "claim_quest_reward": {
        const { questId } = body || {};
        if (!questId) return json({ error: "Quest ID required" }, 400);
        // Quests reward XP only — credits are never minted by gameplay.
        const xp = 30 + Math.floor(Math.random() * 70);
        return json({ success: true, xp, questId, message: `Quest reward claimed: +${xp} XP!` });
      }

      default:
        return json({ error: `Unknown horse action: ${action}` }, 400);
    }
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
