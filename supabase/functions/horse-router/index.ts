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
const COST_BREEDING = 8;
const COST_RACE_ENTRY = 1;
const COST_CHAMPIONSHIP = 5;
const STAT_INCREASE = 5;
const EQUIPMENT_CREDITS: Record<string, number> = {
  // legacy ids
  "racing-saddle": 4, "speed-horseshoes": 6, "stamina-feed": 3,
  "premium-saddle": 10, "golden-horseshoes": 16, "champion-armor": 20,
  // saddles
  saddle_leather: 3, saddle_carbon: 8, saddle_champion: 18, saddle_legendary: 40,
  saddle_royal: 180, saddle_titan: 900, saddle_eternal: 2600, saddle_aureum: 4800,
  // horseshoes
  shoe_iron: 2, shoe_titanium: 7, shoe_diamond: 16, shoe_mythic: 36,
  shoe_storm: 150, shoe_void: 850, shoe_solaris: 2400,
  // bridles
  bridle_basic: 2, bridle_pro: 6, bridle_master: 14,
  bridle_grandmaster: 120, bridle_celestial: 800, bridle_dominion: 2200,
  // blankets
  blanket_wool: 3, blanket_silk: 7, blanket_champion: 16,
  blanket_imperial: 140, blanket_phoenix: 880, blanket_infinity: 3000 };

const HORSE_ACTIONS = ["ping", "create", "breed", "train", "duel", "join_race", "purchase_equipment", "championship_enroll", "claim_quest_reward"];

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

        // Generate the horse portrait (best-effort: never fails the purchase).
        let imageUrl: string | null = null;
        try {
          const key = Deno.env.get("LOVABLE_API_KEY");
          if (key) {
            const prompt =
              `Photorealistic cinematic portrait of a ${color} ${breed} racehorse named "${name}". ` +
              `Athletic thoroughbred build, glossy coat, flowing mane, standing on a sunlit racetrack, ` +
              `shallow depth of field, dramatic golden-hour rim light, ultra detailed, 4k, no text, no watermark.`;
            const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
              method: "POST",
              headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "google/gemini-3.1-flash-lite-image",
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseModalities: ["TEXT", "IMAGE"] } }),
            });
            if (res.ok) {
              const data = await res.json();
              const b64 = data?.data?.[0]?.b64_json;
              if (b64) {
                const bin = atob(b64);
                const bytes = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                const path = `horses/${horse.id}.png`;
                const { error: upErr } = await admin.storage.from("ai-studio")
                  .upload(path, bytes, { contentType: "image/png", upsert: true, cacheControl: "31536000" });
                if (!upErr) {
                  imageUrl = admin.storage.from("ai-studio").getPublicUrl(path).data.publicUrl;
                  await admin.from("horses").update({ image_url: imageUrl }).eq("id", horse.id);
                }
              }
            } else {
              console.error("[horse-router] portrait failed", res.status, await res.text().catch(() => ""));
            }
          }
        } catch (e) {
          console.error("[horse-router] portrait error", e);
        }

        return json({ horse: { ...horse, image_url: imageUrl }, creditsSpent: COST_CREATE_HORSE });
      }

      case "breed": {
        const parent1Id = String(body?.parent1Id ?? "");
        const parent2Id = String(body?.parent2Id ?? "");
        if (!parent1Id || !parent2Id || parent1Id === parent2Id) {
          return json({ error: "Two different parents required" }, 400);
        }
        const { data: parents } = await admin.from("horses").select("*").in("id", [parent1Id, parent2Id]);
        if (!parents || parents.length !== 2) return json({ error: "Parent horses not found" }, 404);
        if (parents.some((p: any) => p.user_id !== user.id)) return json({ error: "Horse not yours" }, 403);

        const err = await spend(COST_BREEDING, "horse-racing:breeding");
        if (err) return err;

        const [p1, p2] = parents as any[];
        const mix = (a: number, b: number) =>
          Math.max(30, Math.min(100, Math.floor((a + b) / 2 + (Math.floor(Math.random() * 11) - 5))));
        const stats = {
          speed_stat: mix(p1.speed_stat, p2.speed_stat),
          stamina_stat: mix(p1.stamina_stat, p2.stamina_stat),
          acceleration_stat: mix(p1.acceleration_stat, p2.acceleration_stat),
          temperament_stat: mix(p1.temperament_stat, p2.temperament_stat) };
        const foalName = `${p1.name} Jr.`;
        const foalColor = Math.random() > 0.5 ? p1.color : p2.color;
        const foalBreed = p1.breed;

        const { data: foal, error: fErr } = await admin.from("horses")
          .insert({ user_id: user.id, name: foalName, breed: foalBreed, color: foalColor, ...stats })
          .select().single();
        if (fErr) {
          await refund(COST_BREEDING, "horse-racing:breeding");
          return json({ error: fErr.message }, 400);
        }

        await admin.from("breeding_records").insert({ user_id: user.id,
          parent1_id: parent1Id,
          parent2_id: parent2Id,
          offspring_id: foal.id,
          cost_coins: COST_BREEDING,
          status: "completed" });

        // Real ancestry tree: direct parents (gen 1) + inherited ancestors (gen n+1).
        try {
          const rows: Array<{ horse_id: string; parent_id: string; parent_role: string; generation: number }> = [
            { horse_id: foal.id, parent_id: parent1Id, parent_role: "sire", generation: 1 },
            { horse_id: foal.id, parent_id: parent2Id, parent_role: "dam", generation: 1 },
          ];
          const { data: ancestors } = await admin
            .from("horse_bloodlines")
            .select("parent_id, parent_role, generation")
            .in("horse_id", [parent1Id, parent2Id])
            .lte("generation", 4);
          for (const a of (ancestors ?? []) as any[]) {
            if (a.parent_id === foal.id) continue;
            rows.push({
              horse_id: foal.id,
              parent_id: a.parent_id,
              parent_role: a.parent_role ?? "sire",
              generation: (a.generation ?? 1) + 1 });
          }
          const seen = new Set<string>();
          const unique = rows.filter((r) => {
            const k = `${r.parent_id}:${r.generation}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
          await admin.from("horse_bloodlines").insert(unique);
        } catch (e) {
          console.error("[horse-router] bloodline insert error", e);
        }


        // Foal portrait + short profile (best-effort).
        let imageUrl: string | null = null;
        let description: string | null = null;
        const key = Deno.env.get("LOVABLE_API_KEY");
        try {
          if (key) {
            const prompt =
              `Adorable photorealistic cinematic portrait of a newborn ${foalColor} ${foalBreed} foal (baby horse) named "${foalName}". ` +
              `Small fluffy body, long thin legs, soft fuzzy coat, big curious eyes, standing in a sunlit meadow beside straw, ` +
              `shallow depth of field, warm golden-hour light, ultra detailed, 4k, no text, no watermark.`;
            const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
              method: "POST",
              headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "google/gemini-3.1-flash-lite-image",
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseModalities: ["TEXT", "IMAGE"] } }),
            });
            if (res.ok) {
              const data = await res.json();
              const b64 = data?.data?.[0]?.b64_json;
              if (b64) {
                const bin = atob(b64);
                const bytes = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                const path = `horses/${foal.id}.png`;
                const { error: upErr } = await admin.storage.from("ai-studio")
                  .upload(path, bytes, { contentType: "image/png", upsert: true, cacheControl: "31536000" });
                if (!upErr) imageUrl = admin.storage.from("ai-studio").getPublicUrl(path).data.publicUrl;
              }
            } else {
              console.error("[horse-router] foal portrait failed", res.status, await res.text().catch(() => ""));
            }
          }
        } catch (e) {
          console.error("[horse-router] foal portrait error", e);
        }

        try {
          if (key) {
            const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [{
                  role: "user",
                  content:
                    `Write a warm 2-3 sentence English profile for a newborn racehorse foal. ` +
                    `Name: ${foalName}. Breed: ${foalBreed}. Coat: ${foalColor}. ` +
                    `Parents: ${p1.name} and ${p2.name}. ` +
                    `Stats — speed ${stats.speed_stat}, stamina ${stats.stamina_stat}, acceleration ${stats.acceleration_stat}, temperament ${stats.temperament_stat}. ` +
                    `Mention its bloodline and racing potential. Plain text only, no markdown.` }] }),
            });
            if (res.ok) {
              const data = await res.json();
              description = data?.choices?.[0]?.message?.content?.trim()?.slice(0, 700) ?? null;
            }
          }
        } catch (e) {
          console.error("[horse-router] foal description error", e);
        }

        if (imageUrl || description) {
          await admin.from("horses")
            .update({ ...(imageUrl ? { image_url: imageUrl } : {}), ...(description ? { description } : {}) })
            .eq("id", foal.id);
        }

        return json({
          foal: { ...foal, image_url: imageUrl, description },
          creditsSpent: COST_BREEDING });
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
        // Real quest tracking: one row per completed training session.
        await admin.from("horse_training_log")
          .insert({ user_id: user.id, horse_id: horseId, stat_type: statType });
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
        // Server validates real progress; quests reward XP only, never credits.
        const { data: res, error: qErr } = await userClient.rpc("claim_horse_quest", { _quest_id: questId });
        if (qErr) return json({ error: qErr.message }, 400);
        const r = res as any;
        if (!r?.claimed) {
          const reason = r?.reason === "already_claimed"
            ? "Reward already claimed for this period"
            : r?.reason === "incomplete"
              ? `Quest not complete yet (${r?.progress ?? 0}/${r?.requirement ?? "?"})`
              : "Quest reward unavailable";
          return json({ error: reason }, 400);
        }
        return json({ success: true, xp: r.xp, questId, message: `Quest reward claimed: +${r.xp} XP!` });
      }

      /**
       * Head-to-head live race between exactly two horses (1v1 duel).
       * Server-authoritative: it simulates 4 sectors, records the duel and
       * pays the winner. Entry costs 1 credit, the winner gets 2 back.
       */
      case "duel": {
        const { myHorseId, opponentHorseId } = body || {};
        if (!myHorseId || !opponentHorseId) return json({ error: "Two horses required" }, 400);
        if (myHorseId === opponentHorseId) return json({ error: "Pick a different rival" }, 400);

        const { data: mine } = await admin.from("horses").select("*").eq("id", myHorseId).maybeSingle();
        if (!mine || mine.user_id !== user.id) return json({ error: "Horse not yours" }, 403);
        const { data: rival } = await admin.from("horses").select("*").eq("id", opponentHorseId).maybeSingle();
        if (!rival) return json({ error: "Rival horse not found" }, 404);
        if (rival.user_id === user.id) return json({ error: "Pick a rival from another player" }, 400);

        const err = await spend(COST_RACE_ENTRY, "horse-racing:duel-entry");
        if (err) return err;

        const rating = (h: any) =>
          (h.speed_stat ?? 50) * 1.3 + (h.stamina_stat ?? 50) * 1.1 +
          (h.acceleration_stat ?? 50) * 1.0 + (h.temperament_stat ?? 50) * 0.6 +
          (h.level ?? 1) * 4;

        const sectors = ["Start", "Back straight", "Final turn", "Home stretch"];
        const log: { sector: string; mine: number; theirs: number; note: string }[] = [];
        let myTime = 0, theirTime = 0;
        for (const sector of sectors) {
          const a = rating(mine) * (0.85 + Math.random() * 0.3);
          const b = rating(rival) * (0.85 + Math.random() * 0.3);
          const ta = 3000 / Math.max(a, 1);
          const tb = 3000 / Math.max(b, 1);
          myTime += ta;
          theirTime += tb;
          log.push({
            sector,
            mine: Math.round(ta * 100) / 100,
            theirs: Math.round(tb * 100) / 100,
            note: ta < tb ? `${mine.name} takes the lead` : `${rival.name} pushes ahead` });
        }
        const iWon = myTime <= theirTime;
        const winnerHorseId = iWon ? mine.id : rival.id;
        const prize = iWon ? COST_RACE_ENTRY * 2 : 0;

        // Stats for both horses (real data for both owners).
        await admin.from("horses").update({
          total_races: (mine.total_races ?? 0) + 1,
          race_wins: (mine.race_wins ?? 0) + (iWon ? 1 : 0),
          experience: (mine.experience ?? 0) + (iWon ? 25 : 10),
          level: Math.floor(((mine.experience ?? 0) + (iWon ? 25 : 10)) / 100) + 1,
        }).eq("id", mine.id);
        await admin.from("horses").update({
          total_races: (rival.total_races ?? 0) + 1,
          race_wins: (rival.race_wins ?? 0) + (iWon ? 0 : 1),
          experience: (rival.experience ?? 0) + (iWon ? 10 : 25),
          level: Math.floor(((rival.experience ?? 0) + (iWon ? 10 : 25)) / 100) + 1,
        }).eq("id", rival.id);

        if (prize > 0) {
          await admin.rpc("add_ai_credits", { p_user_id: user.id,
            p_amount: prize,
            p_reason: "horse-racing:duel-prize",
            p_source: "horse_racing" });
        }

        const { data: duel } = await admin.from("horse_duels").insert({
          challenger_user_id: user.id,
          challenger_horse_id: mine.id,
          opponent_user_id: rival.user_id,
          opponent_horse_id: rival.id,
          winner_horse_id: winnerHorseId,
          challenger_time: Math.round(myTime * 100) / 100,
          opponent_time: Math.round(theirTime * 100) / 100,
          credits_spent: COST_RACE_ENTRY,
          credits_won: prize,
          log }).select().maybeSingle();

        return json({
          success: true,
          duelId: duel?.id ?? null,
          won: iWon,
          winnerHorseId,
          myTime: Math.round(myTime * 100) / 100,
          opponentTime: Math.round(theirTime * 100) / 100,
          log,
          creditsSpent: COST_RACE_ENTRY,
          creditsWon: prize });
      }


      default:
        return json({ error: `Unknown horse action: ${action}` }, 400);
    }
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
