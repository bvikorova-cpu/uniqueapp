import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { deductAICredits, refundAICredits } from "../_shared/credits.ts";
import { generateOpenAIImage } from "../_shared/unifiedAI.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const DRAW_COST = 5;

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
        .upload(path, bytes, { contentType: "image/png", upsert: true });
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
    const auth = req.headers.get("Authorization");
    if (!auth) return j({ error: "Unauthorized" }, 401);

    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user } } = await anon.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return j({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "draw");
    const db = admin();

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

    // ── Draw a new random card (5 credits) ─────────────────────────────────
    const { data: owned } = await db.from("hero_collection_cards")
      .select("collectible_id").eq("user_id", user.id);
    const ownedIds = (owned ?? []).map((o: { collectible_id: string }) => o.collectible_id);

    let q = db.from("hero_collectibles").select("*");
    if (ownedIds.length) q = q.not("id", "in", `(${ownedIds.join(",")})`);
    const { data: pool, error: poolErr } = await q.limit(500);
    if (poolErr) return j({ error: "Could not load the card pool" }, 500);
    if (!pool || pool.length === 0) {
      return j({ error: "You already own all 200 hero cards — the collection is complete!", code: "COLLECTION_COMPLETE" }, 400);
    }

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
      const card = pool[Math.floor(Math.random() * pool.length)];
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
