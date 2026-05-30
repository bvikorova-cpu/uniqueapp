// Universal horse router - consolidates 6 horse-* functions.
// Frontend calls remain unchanged via proxyMap.ts rewrite.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { checkTestMode } from "../_shared/testMode.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const VALID_STATS = ["speed", "stamina", "acceleration", "temperament"] as const;
const TRAINING_COST = 20;
const STAT_INCREASE = 5;
const EQUIPMENT_PRICES: Record<string, number> = {
  "racing-saddle": 200, "speed-horseshoes": 300, "stamina-feed": 150,
  "premium-saddle": 500, "golden-horseshoes": 800, "champion-armor": 1000,
};
const CHAMPIONSHIP_FEE = 500;

const HORSE_ACTIONS = ["ping", "create", "train", "join_race", "purchase_equipment", "championship_enroll", "claim_quest_reward"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    // Health probe: no auth, no credits.
    const probe = req.method === "GET" ? {} : await req.clone().json().catch(() => ({}));
    if ((probe as any)?.action === "ping" || new URL(req.url).searchParams.get("action") === "ping") {
      return json({ ok: true, router: "horse-router", actions: HORSE_ACTIONS });
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

    const body = await req.json().catch(() => ({} as any));
    const action = String(body?.action ?? "").trim();

    switch (action) {
      case "create": {
        const name = String(body?.name ?? "").trim().slice(0, 60);
        const breed = String(body?.breed ?? "").trim().slice(0, 60);
        const color = String(body?.color ?? "").trim().slice(0, 40);
        const costCoins = Math.max(0, Math.floor(Number(body?.costCoins) || 0));
        if (!name || !breed || !color) return json({ error: "Missing fields" }, 400);
        if (costCoins <= 0) return json({ error: "Invalid cost" }, 400);

        const { data: cur, error: curErr } = await admin
          .from("horse_currency").select("coins").eq("user_id", user.id).maybeSingle();
        if (curErr) throw curErr;
        if (!cur || cur.coins < costCoins) return json({ error: "Insufficient coins" }, 400);

        const { data: deducted, error: dedErr } = await admin
          .from("horse_currency")
          .update({ coins: cur.coins - costCoins })
          .eq("user_id", user.id).eq("coins", cur.coins).select().maybeSingle();
        if (dedErr) throw dedErr;
        if (!deducted) return json({ error: "Concurrent modification, retry" }, 409);

        const stats = {
          speed_stat: Math.floor(Math.random() * 30) + 40,
          stamina_stat: Math.floor(Math.random() * 30) + 40,
          acceleration_stat: Math.floor(Math.random() * 30) + 40,
          temperament_stat: Math.floor(Math.random() * 30) + 40,
        };
        const { data: horse, error: hErr } = await admin
          .from("horses")
          .insert({ user_id: user.id, name, breed, color, ...stats })
          .select().single();
        if (hErr) {
          await admin.from("horse_currency").update({ coins: cur.coins }).eq("user_id", user.id);
          throw hErr;
        }
        return json({ horse });
      }

      case "train": {
        const { horseId, statType } = body || {};
        if (!horseId || !VALID_STATS.includes(statType)) return json({ error: "Invalid input" }, 400);

        const { data: horse } = await admin.from("horses").select("*").eq("id", horseId).maybeSingle();
        if (!horse || horse.user_id !== user.id) return json({ error: "Horse not yours" }, 403);

        const { data: cur } = await admin.from("horse_currency").select("coins")
          .eq("user_id", user.id).maybeSingle();
        if (!cur || cur.coins < TRAINING_COST) return json({ error: "Insufficient coins" }, 400);

        const { data: deducted } = await admin.from("horse_currency")
          .update({ coins: cur.coins - TRAINING_COST })
          .eq("user_id", user.id).eq("coins", cur.coins).select().maybeSingle();
        if (!deducted) return json({ error: "Concurrent modification, retry" }, 409);

        const statField = `${statType}_stat`;
        const newValue = Math.min((horse[statField] || 0) + STAT_INCREASE, 100);
        const newXP = (horse.experience || 0) + 10;
        const newLevel = Math.floor(newXP / 100) + 1;

        const { error: uErr } = await admin.from("horses")
          .update({ [statField]: newValue, experience: newXP, level: newLevel })
          .eq("id", horseId);
        if (uErr) {
          await admin.from("horse_currency").update({ coins: cur.coins }).eq("user_id", user.id);
          throw uErr;
        }
        return json({ statType, newValue });
      }

      case "join_race": {
        const { raceId, horseId, strategy } = body || {};
        if (!raceId || !horseId || !strategy) return json({ error: "Missing fields" }, 400);

        const { data: horse } = await admin.from("horses").select("user_id").eq("id", horseId).maybeSingle();
        if (!horse || horse.user_id !== user.id) return json({ error: "Horse not yours" }, 403);

        const { data: race } = await admin.from("races").select("entry_fee_coins,status")
          .eq("id", raceId).maybeSingle();
        if (!race) return json({ error: "Race not found" }, 404);
        if (race.status !== "waiting") return json({ error: "Race not joinable" }, 400);

        const fee = race.entry_fee_coins ?? 0;
        const { data: cur } = await admin.from("horse_currency").select("coins")
          .eq("user_id", user.id).maybeSingle();
        if (!cur || cur.coins < fee) return json({ error: "Insufficient coins" }, 400);

        const { data: deducted } = await admin.from("horse_currency")
          .update({ coins: cur.coins - fee })
          .eq("user_id", user.id).eq("coins", cur.coins).select().maybeSingle();
        if (!deducted) return json({ error: "Concurrent modification, retry" }, 409);

        const { data: part, error: pErr } = await admin.from("race_participants")
          .insert({ race_id: raceId, horse_id: horseId, user_id: user.id, strategy })
          .select().single();
        if (pErr) {
          await admin.from("horse_currency").update({ coins: cur.coins }).eq("user_id", user.id);
          const msg = pErr.message?.includes("race_participants_race_user_unique")
            ? "Already joined this race" : pErr.message;
          return json({ error: msg }, 400);
        }
        return json({ participant: part });
      }

      case "purchase_equipment": {
        const { itemId, horseId } = body || {};
        if (!itemId || !horseId) return json({ error: "Item and horse required" }, 400);
        const price = EQUIPMENT_PRICES[itemId] || 250;
        const { data: currency } = await admin.from("horse_racing_currency")
          .select("*").eq("user_id", user.id).single();
        if (!currency || currency.balance < price) return json({ error: "Insufficient coins" }, 400);
        await admin.from("horse_racing_currency")
          .update({ balance: currency.balance - price }).eq("user_id", user.id);
        return json({ success: true, itemId, horseId, price, message: `Equipment purchased for ${price} coins!` });
      }

      case "championship_enroll": {
        const { seasonId, horseId } = body || {};
        if (!seasonId || !horseId) return json({ error: "Season and horse required" }, 400);
        const { data: currency } = await admin.from("horse_racing_currency")
          .select("*").eq("user_id", user.id).single();
        if (!currency || currency.balance < CHAMPIONSHIP_FEE) {
          return json({ error: "Insufficient coins for championship entry" }, 400);
        }
        await admin.from("horse_racing_currency")
          .update({ balance: currency.balance - CHAMPIONSHIP_FEE }).eq("user_id", user.id);
        return json({ success: true, message: "Successfully enrolled in championship", seasonId, horseId, entryFee: CHAMPIONSHIP_FEE });
      }

      case "claim_quest_reward": {
        const { questId } = body || {};
        if (!questId) return json({ error: "Quest ID required" }, 400);
        const reward = 100 + Math.floor(Math.random() * 200);
        const { data: currency } = await admin.from("horse_racing_currency")
          .select("*").eq("user_id", user.id).single();
        if (currency) {
          await admin.from("horse_racing_currency")
            .update({ balance: currency.balance + reward }).eq("user_id", user.id);
        }
        return json({ success: true, reward, questId, message: `Quest reward claimed: ${reward} coins!` });
      }

      default:
        return json({ error: `Unknown horse action: ${action}` }, 400);
    }
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
