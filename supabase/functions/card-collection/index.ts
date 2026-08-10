import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { deductAICredits, refundAICredits } from "../_shared/credits.ts";
import { generateOpenAIImage } from "../_shared/unifiedAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DRAW_COST = 1;
const CARDS_PER_CATEGORY = 150;
/** The very last missing card of a set stays extremely scarce. */
const FINAL_TARGET_DRAWS = 20000;
const DUPLICATE_WEIGHT = 6;

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

const admin = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

const ORIGINALITY =
  "Completely original design — must not copy or resemble any existing trademarked character, brand, logo or celebrity " +
  "likeness. No text, no watermark, no signature.";

function cardPrompt(card: Record<string, any>, cat: Record<string, any>) {
  if (card.is_prime) {
    return `Golden premium collectible trading-card illustration of "${card.name}", the crowning Prime card of the ` +
      `${cat.name} collection (${cat.description}). Radiant gold-foil framing, glowing light rays, majestic centred ` +
      `composition, ${cat.art_style}, ultra premium collectible card aesthetic. ${ORIGINALITY}`;
  }
  return `Collectible trading-card illustration of "${card.name}", an original ${card.subject} from the ${cat.name} ` +
    `collection (${cat.description}). ${cat.art_style}, dramatic rim lighting, ${card.rarity} rarity energy aura, ` +
    `rich saturated colours, centred portrait composition, epic detailed background. ${ORIGINALITY}`;
}

/** Generates the fixed card artwork once and caches it on the card row forever. */
async function ensureArtwork(card: Record<string, any>, cat: Record<string, any>): Promise<string | null> {
  if (card.image_url) return card.image_url as string;
  try {
    const img = await generateOpenAIImage(cardPrompt(card, cat), "1024x1024");
    let url: string | null = img.url ?? null;
    const db = admin();
    if (img.b64_json) {
      const bytes = Uint8Array.from(atob(img.b64_json), (ch) => ch.charCodeAt(0));
      const path = `collection-cards/${card.code}.png`;
      const { error: upErr } = await db.storage
        .from("ai-studio")
        .upload(path, bytes, { contentType: "image/png", upsert: true, cacheControl: "31536000" });
      if (upErr) throw upErr;
      url = db.storage.from("ai-studio").getPublicUrl(path).data.publicUrl;
    }
    if (url) await db.from("card_collectibles").update({ image_url: url }).eq("id", card.id);
    return url;
  } catch (e) {
    console.error("[card-collection] artwork failed", e);
    return null;
  }
}

async function getCategory(slug: string) {
  const { data } = await admin().from("card_categories").select("*").eq("slug", slug).maybeSingle();
  return data;
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
    const category = String(body?.category ?? "");
    const db = admin();

    if (action !== "keep" && !category) return j({ error: "Category is required" }, 400);

    // ── Free artwork backfill so albums show real illustrations ────────────
    if (action === "backfill_art") {
      const cat = await getCategory(category);
      if (!cat) return j({ error: "Category not found" }, 404);
      const limit = Math.min(Math.max(Number(body?.limit ?? 4), 1), 6);
      const { data: missing } = await db
        .from("card_collectibles")
        .select("*")
        .eq("category_slug", category)
        .is("image_url", null)
        .order("card_index", { ascending: true })
        .limit(limit);
      let generated = 0;
      for (const card of missing ?? []) {
        if (await ensureArtwork(card, cat)) generated++;
      }
      const { count } = await db
        .from("card_collectibles")
        .select("id", { count: "exact", head: true })
        .eq("category_slug", category)
        .is("image_url", null);
      return j({ generated, missing: count ?? 0 });
    }

    // ── Prime card: free reward for a completed set ────────────────────────
    if (action === "prime_status" || action === "claim_prime") {
      const cat = await getCategory(category);
      if (!cat) return j({ error: "Category not found" }, 404);

      const { data: prime } = await db
        .from("card_collectibles")
        .select("*")
        .eq("category_slug", category)
        .eq("is_prime", true)
        .maybeSingle();

      const { count: totalCards } = await db
        .from("card_collectibles")
        .select("id", { count: "exact", head: true })
        .eq("category_slug", category)
        .eq("is_prime", false);

      const { data: owned } = await db
        .from("user_card_collection")
        .select("collectible_id")
        .eq("user_id", user.id)
        .eq("category_slug", category)
        .limit(5000);
      const ownedIds = new Set((owned ?? []).map((r: any) => r.collectible_id));
      const claimed = prime ? ownedIds.has(prime.id) : false;
      const total = totalCards ?? CARDS_PER_CATEGORY;
      const uniqueOwned = [...ownedIds].filter((id) => !prime || id !== prime.id).length;
      const complete = total > 0 && uniqueOwned >= total;

      if (action === "prime_status") {
        return j({ complete, claimed, uniqueOwned, total, card: prime ? { ...prime } : null });
      }

      if (!prime) return j({ error: "This collection has no Prime card." }, 404);
      if (claimed) return j({ error: "You have already claimed this Prime card." }, 400);
      if (!complete) return j({ error: "Complete the whole set first — every card needs at least one copy." }, 400);

      const imageUrl = await ensureArtwork(prime, cat);
      const { error: insErr } = await db.from("user_card_collection").insert({
        user_id: user.id,
        collectible_id: prime.id,
        category_slug: category,
        credits_spent: 0,
      });
      if (insErr && !String(insErr.message).includes("duplicate")) {
        console.error("[card-collection] prime claim failed", insErr);
        return j({ error: "The Prime card could not be added, please try again." }, 500);
      }
      return j({ card: { ...prime, image_url: imageUrl } });
    }

    // ── Keep a drawn card (already paid at draw time) ──────────────────────
    if (action === "keep") {
      const collectibleId = String(body?.collectibleId ?? "");
      if (!collectibleId) return j({ error: "Card is required" }, 400);

      const { data: card } = await db
        .from("card_collectibles")
        .select("id, name, category_slug")
        .eq("id", collectibleId)
        .maybeSingle();
      if (!card) return j({ error: "Card not found" }, 404);

      const { data: existing } = await db
        .from("user_card_collection")
        .select("id, copies")
        .eq("user_id", user.id)
        .eq("collectible_id", collectibleId)
        .maybeSingle();

      if (existing) {
        const { error: updErr } = await db
          .from("user_card_collection")
          .update({ copies: (existing.copies ?? 1) + 1, credits_spent: DRAW_COST })
          .eq("id", existing.id);
        if (updErr) return j({ error: "Could not stack the duplicate, please try again." }, 500);
      } else {
        const { error: insErr } = await db.from("user_card_collection").insert({
          user_id: user.id,
          collectible_id: collectibleId,
          category_slug: card.category_slug,
          credits_spent: DRAW_COST,
        });
        if (insErr && !String(insErr.message).includes("duplicate")) {
          console.error("[card-collection] keep failed", insErr);
          return j({ error: "Could not save the card, please try again." }, 500);
        }
      }

      await db.rpc("increment_card_times_collected" as never, { _id: collectibleId } as never).catch?.(() => {});
      return j({ ok: true, name: card.name });
    }

    // ── Draw ───────────────────────────────────────────────────────────────
    const cat = await getCategory(category);
    if (!cat) return j({ error: "Category not found" }, 404);

    const { data: pool } = await db
      .from("card_collectibles")
      .select("*")
      .eq("category_slug", category)
      .eq("is_prime", false)
      .order("card_index", { ascending: true });
    if (!pool || pool.length === 0) return j({ error: "This collection is empty." }, 404);

    const denied = await deductAICredits(user.id, DRAW_COST, "collection_card_draw");
    if (denied) return denied;

    const { data: balRow } = await db.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    const after = balRow?.credits_remaining ?? 0;
    await db.from("ai_credits_ledger").insert({
      user_id: user.id,
      delta: -DRAW_COST,
      balance_before: after + DRAW_COST,
      balance_after: after,
      reason: `collection_card_draw:${category}`,
      source: "card_collections",
    });

    try {
      const { data: owned } = await db
        .from("user_card_collection")
        .select("collectible_id, copies")
        .eq("user_id", user.id)
        .eq("category_slug", category)
        .limit(5000);
      const ownedIds = new Set((owned ?? []).map((r: any) => r.collectible_id));
      const drawsSoFar = (owned ?? []).reduce((a: number, r: any) => a + (r.copies ?? 1), 0) + 1;

      let eligible = pool;
      const missing = pool.filter((c: any) => !ownedIds.has(c.id));
      if (missing.length === 1 && pool.length > 1) {
        let reveal = false;
        if (drawsSoFar >= FINAL_TARGET_DRAWS) reveal = true;
        else if (drawsSoFar > FINAL_TARGET_DRAWS - 1000) {
          reveal = Math.random() < 1 / (FINAL_TARGET_DRAWS - drawsSoFar + 1);
        }
        if (!reveal) eligible = pool.filter((c: any) => c.id !== missing[0].id);
      }

      const weights = eligible.map((c: any) => (ownedIds.has(c.id) ? DUPLICATE_WEIGHT : 1));
      const totalWeight = weights.reduce((a: number, b: number) => a + b, 0);
      let roll = Math.random() * totalWeight;
      let card = eligible[eligible.length - 1];
      for (let i = 0; i < eligible.length; i++) {
        roll -= weights[i];
        if (roll <= 0) { card = eligible[i]; break; }
      }

      const imageUrl = await ensureArtwork(card, cat);
      return j({
        card: { ...card, image_url: imageUrl },
        creditsUsed: DRAW_COST,
        remaining: after,
        poolSize: pool.length,
      });
    } catch (e) {
      await refundAICredits(user.id, DRAW_COST, "collection_card_draw");
      console.error("[card-collection] draw failed", e);
      return j({ error: "The draw failed and your credit was refunded — please try again." }, 502);
    }
  } catch (e) {
    return j({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
