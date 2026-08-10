import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { deductAICredits, refundAICredits } from "../_shared/credits.ts";
import { generateOpenAIImage } from "../_shared/unifiedAI.ts";
import { handleCardCollection } from "../_shared/cardCollection.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const DRAW_COST = 1;
const UNITAS_COST = 10000;
const UNITAS_NAME = "Unitas";
const UNITAS_PROMPT =
  `Golden legendary collectible trading-card portrait of "Unitas", the ultimate mega hero. Radiant living-gold armour ` +
  `with glowing engraved sigils, flowing golden cape, halo of golden light, majestic heroic upper-body pose, ` +
  `cinematic god-rays, deep dark background with golden particles, painterly comic-cinematic digital art, ultra premium ` +
  `gold-foil card aesthetic. Completely original character design — must not copy or resemble any existing Marvel, DC or ` +
  `other trademarked hero, no known logos, emblems or celebrity likeness. No text, no watermark.`;

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

const admin = () => createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

/** Fixed collection artwork prompt — always original characters, no trademarked heroes. */
function cardPrompt(c: Record<string, unknown>) {
  return `Collectible trading-card portrait of "${c.name}", an original ${c.archetype} of the ${c.faction}. ` +
    `Heroic upper-body pose, dramatic rim lighting, ${c.rarity} rarity energy aura, painterly comic-cinematic digital art, ` +
    `rich saturated colors, dark epic background. Completely original character design — must not copy or resemble any ` +
    `existing Marvel, DC or other trademarked hero, no known logos, emblems or celebrity likeness. No text, no watermark.`;
}

/** Generates the card artwork once and caches it on the collectible row forever. */
async function ensureArtwork(card: Record<string, any>): Promise<string | null> {
  if (card.image_url) return card.image_url as string;
  try {
    const img = await generateOpenAIImage(cardPrompt(card), "1024x1024");
    let url: string | null = img.url ?? null;
    if (img.b64_json) {
      const bytes = Uint8Array.from(atob(img.b64_json), (ch) => ch.charCodeAt(0));
      const path = `hero-cards/${card.code}.png`;
      const db = admin();
      const { error: upErr } = await db.storage.from("ai-studio")
        .upload(path, bytes, { contentType: "image/png", upsert: true, cacheControl: "31536000" });
      if (upErr) throw upErr;
      url = db.storage.from("ai-studio").getPublicUrl(path).data.publicUrl;
    }
    if (url) await admin().from("hero_collectibles").update({ image_url: url }).eq("id", card.id);
    return url;
  } catch (e) {
    console.error("[hero-card-draw] artwork failed", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));

    // Collectible-card categories share this endpoint (function-slot limit).
    if (body?.scope === "collection") return await handleCardCollection(req, body);

    const auth = req.headers.get("Authorization");
    if (!auth) return j({ error: "Unauthorized" }, 401);

    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user } } = await anon.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return j({ error: "Unauthorized" }, 401);


    const action = String(body?.action ?? "draw");
    const db = admin();

    // ── Album artwork backfill (free) ─────────────────────────────────────
    // Generates the fixed collection artwork for cards that don't have it yet
    // so the album shows real hero images instead of placeholders.
    if (action === "backfill_art") {
      const limit = Math.min(Math.max(Number(body?.limit ?? 3), 1), 4);
      const { data: missing } = await db.from("hero_collectibles")
        .select("*").is("image_url", null).order("code", { ascending: true }).limit(limit);
      let generated = 0;
      for (const card of missing ?? []) {
        const url = await ensureArtwork(card);
        if (url) generated++;
      }
      const { count: remainingMissing } = await db.from("hero_collectibles")
        .select("id", { count: "exact", head: true }).is("image_url", null);
      return j({ generated, missing: remainingMissing ?? 0 });
    }


    // ── Unitas: golden completion reward ──────────────────────────────────
    // Unlocks only when the collector owns at least 1 copy of every card.
    if (action === "unitas_status" || action === "claim_unitas") {
      const { count: totalCards } = await db.from("hero_collectibles")
        .select("id", { count: "exact", head: true });
      const { data: ownedRows } = await db.from("hero_collection_cards")
        .select("collectible_id").eq("user_id", user.id).limit(50000);
      const uniqueOwned = new Set((ownedRows ?? []).map((r: any) => r.collectible_id)).size;
      const total = totalCards ?? 200;
      const complete = total > 0 && uniqueOwned >= total;

      const { data: existing } = await db.from("characters")
        .select("id, name, image_url, hp, attack, defense, speed, backstory")
        .eq("user_id", user.id).eq("name", UNITAS_NAME).maybeSingle();

      if (action === "unitas_status") {
        return j({ complete, uniqueOwned, total, cost: UNITAS_COST, claimed: !!existing, character: existing ?? null });
      }

      if (existing) return j({ error: "You have already claimed Unitas.", character: existing }, 400);
      if (!complete) return j({ error: "Complete the whole collection first — every card needs at least one copy." }, 400);

      const deniedU = await deductAICredits(user.id, UNITAS_COST, "unitas_mega_hero");
      if (deniedU) return deniedU;

      const { data: balU } = await db.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
      const afterU = balU?.credits_remaining ?? 0;
      await db.from("ai_credits_ledger").insert({ user_id: user.id,
        delta: -UNITAS_COST,
        balance_before: afterU + UNITAS_COST,
        balance_after: afterU,
        reason: "unitas_mega_hero",
        source: "character_arena" });

      try {
        let imageUrl: string | null = null;
        const img = await generateOpenAIImage(UNITAS_PROMPT, "1024x1024");
        if (img.b64_json) {
          const bytes = Uint8Array.from(atob(img.b64_json), (ch) => ch.charCodeAt(0));
          const path = `characters/${user.id}/unitas-${Date.now()}.png`;
          const { error: upErr } = await db.storage.from("ai-studio")
            .upload(path, bytes, { contentType: "image/png", upsert: true, cacheControl: "31536000" });
          if (upErr) throw upErr;
          imageUrl = db.storage.from("ai-studio").getPublicUrl(path).data.publicUrl;
        } else if (img.url) {
          imageUrl = img.url;
        }

        const { data: hero, error: heroErr } = await db.from("characters").insert({
          user_id: user.id,
          name: UNITAS_NAME,
          category: "cosmic",
          description: "The golden mega hero, forged from all 200 collected hero cards.",
          backstory: "Unitas was never born — he was assembled. When a single collector finally gathered every one of the 200 legendary hero cards, their combined willpower fused into one radiant golden being. Unitas carries a fragment of every hero who came before him: their courage, their scars, their impossible strength. His armour is living gold that reshapes itself into any weapon the moment is asking for. No arena has ever contained him for long, and no opponent has ever seen the same Unitas twice. He fights not for glory, but to prove that everything gathered together is stronger than anything standing alone.",
          image_url: imageUrl,
          hp: 500,
          attack: 250,
          defense: 240,
          speed: 220,
          special_power: "Unity Cascade — channels the power of all 200 heroes at once",
          level: 20,
          is_premium: true,
        }).select().single();
        if (heroErr) throw heroErr;

        return j({ character: hero, creditsUsed: UNITAS_COST, remaining: afterU });
      } catch (e) {
        await refundAICredits(user.id, UNITAS_COST, "unitas_mega_hero");
        console.error("[hero-card-draw] unitas claim failed", e);
        return j({ error: "Unitas could not be forged — your credits were refunded. Please try again." }, 502);
      }
    }

    // ── Keep a drawn card (already paid at draw time) ──────────────────────

    if (action === "keep") {
      const collectibleId = String(body?.collectibleId ?? "");
      if (!collectibleId) return j({ error: "Card is required" }, 400);

      const { data: card } = await db.from("hero_collectibles").select("id, name").eq("id", collectibleId).maybeSingle();
      if (!card) return j({ error: "Card not found" }, 404);

      const { error: insErr } = await db.from("hero_collection_cards")
        .insert({ user_id: user.id, collectible_id: collectibleId, credits_spent: DRAW_COST });
      if (insErr && !String(insErr.message).includes("duplicate")) {
        console.error("[hero-card-draw] keep failed", insErr);
        return j({ error: "Could not add the card to your collection" }, 400);
      }
      const { count } = await db.from("hero_collection_cards")
        .select("id", { count: "exact", head: true })
        .eq("collectible_id", collectibleId);
      await db.from("hero_collectibles").update({ times_collected: count ?? 1 }).eq("id", collectibleId);


      return j({ kept: true, name: card.name });
    }

    // ── Draw a random card (1 credit) — duplicates are allowed ────────────
    const { data: pool, error: poolErr } = await db.from("hero_collectibles").select("*").limit(500);
    if (poolErr) return j({ error: "Could not load the card pool" }, 500);
    if (!pool || pool.length === 0) return j({ error: "The card pool is empty" }, 400);


    const denied = await deductAICredits(user.id, DRAW_COST, "hero_card_draw");
    if (denied) return denied;

    const { data: balRow } = await db.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    const after = balRow?.credits_remaining ?? 0;
    await db.from("ai_credits_ledger").insert({ user_id: user.id,
      delta: -DRAW_COST,
      balance_before: after + DRAW_COST,
      balance_after: after,
      reason: "hero_card_draw",
      source: "character_arena" });

    try {
      // Weighting layer: when a collector is one card away from completing the
      // album, the very last missing card stays extremely scarce.
      let eligible = pool;
      const { data: owned } = await db.from("hero_collection_cards")
        .select("collectible_id").eq("user_id", user.id).limit(50000);
      const ownedIds = new Set((owned ?? []).map((r: any) => r.collectible_id));
      const missing = pool.filter((c: any) => !ownedIds.has(c.id));
      if (missing.length === 1 && pool.length > 1) {
        const draws = (owned ?? []).length + 1; // this draw included
        const FINAL_TARGET = 20000;
        let reveal = false;
        if (draws >= FINAL_TARGET) reveal = true;
        else if (draws > FINAL_TARGET - 1000) reveal = Math.random() < 1 / (FINAL_TARGET - draws + 1);
        if (!reveal) eligible = pool.filter((c: any) => c.id !== missing[0].id);
      }

      // Duplicate bias: cards the collector already owns come up far more often,
      // so repeats are common and new cards feel rare.
      const DUPLICATE_WEIGHT = 6;
      const weights = eligible.map((c: any) => (ownedIds.has(c.id) ? DUPLICATE_WEIGHT : 1));
      const totalWeight = weights.reduce((a: number, b: number) => a + b, 0);
      let roll = Math.random() * totalWeight;
      let card = eligible[eligible.length - 1];
      for (let i = 0; i < eligible.length; i++) {
        roll -= weights[i];
        if (roll <= 0) { card = eligible[i]; break; }
      }
      const imageUrl = await ensureArtwork(card);
      return j({ card: { ...card, image_url: imageUrl }, creditsUsed: DRAW_COST, remaining: after, poolLeft: pool.length });

    } catch (e) {
      await refundAICredits(user.id, DRAW_COST, "hero_card_draw");
      console.error("[hero-card-draw] draw failed", e);
      return j({ error: "The draw failed and your credits were refunded — please try again." }, 502);
    }
  } catch (e) {
    return j({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
