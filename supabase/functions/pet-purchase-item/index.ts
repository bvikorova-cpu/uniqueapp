import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";

// Server-side pet item purchase: validates price from DB (not client), deducts credits
// atomically with optimistic lock, grants accessory or opens mystery box.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errorResponse("Missing authorization", 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return errorResponse("Not authenticated", 401);

    const body = await req.json();
    const { itemType, itemId } = body;
    const petName: string | undefined = body.petName;
    if (!itemType || !itemId) return errorResponse("itemType and itemId required", 400);
    const VALID = new Set(["accessory", "mystery", "pet_type"]);
    if (!VALID.has(itemType)) return errorResponse("Invalid itemType", 400);
    if (itemType === "pet_type" && (!petName || !String(petName).trim())) {
      return errorResponse("petName required for pet adoption", 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Look up canonical price from DB (NEVER trust client)
    const tableMap: Record<string, string> = {
      accessory: "pet_accessories",
      mystery: "pet_mystery_boxes",
      pet_type: "pet_types",
    };
    const { data: item, error: itemErr } = await admin.from(tableMap[itemType]).select("*").eq("id", itemId).maybeSingle();
    if (itemErr || !item) return errorResponse("Item not found", 404);
    const price = Number(item.price) || 0;
    if (price < 0) return errorResponse("Invalid item price", 500);

    // Check + atomic deduct via optimistic lock (skip if free pet type)
    const { data: row } = await admin.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    const remaining = row?.credits_remaining ?? 0;
    if (price > 0) {
      if (remaining < price) {
        return jsonResponse(
          { error: "Insufficient credits", code: "INSUFFICIENT_CREDITS", required: price, remaining },
          402
        );
      }
      const { error: updErr, count } = await admin
        .from("ai_credits")
        .update({ credits_remaining: remaining - price, last_used_at: new Date().toISOString() }, { count: "exact" })
        .eq("user_id", user.id)
        .eq("credits_remaining", remaining);
      if (updErr || count === 0) return errorResponse("Credit deduction failed", 500);
    }

    // Grant the item
    let reward: any = null;
    if (itemType === "accessory") {
      const { error: grantErr } = await admin.from("user_pet_accessories").insert({
        user_id: user.id, accessory_id: itemId,
      });
      if (grantErr) return errorResponse(grantErr.message, 500);
      reward = { type: "accessory", name: item.name };
    } else if (itemType === "mystery") {
      const possible = (item.possible_rewards as string[]) || [];
      const drawn = possible.length ? possible[Math.floor(Math.random() * possible.length)] : "nothing";
      reward = { type: "mystery", boxName: item.name, reward: drawn };
    } else {
      // pet_type adoption
      const { data: pet, error: petErr } = await admin.from("pets").insert({
        user_id: user.id, pet_type_id: itemId, name: String(petName).trim(),
      }).select().single();
      if (petErr) return errorResponse(petErr.message, 500);
      reward = { type: "pet", pet };
    }

    if (price > 0) {
      const desc =
        itemType === "accessory" ? `Purchased ${item.name}` :
        itemType === "mystery" ? `Opened ${item.name} → ${reward.reward}` :
        `Adopted ${item.name} as "${petName}"`;
      await admin.from("ai_usage_history").insert({
        user_id: user.id,
        usage_type: itemType === "pet_type" ? "pet_adoption" : "custom_generation",
        credits_used: price,
        description: desc,
      });
    }

    return jsonResponse({ success: true, reward, creditsRemaining: remaining - (price > 0 ? price : 0) });
  } catch (e: any) {
    return errorResponse(e.message || "Purchase failed");
  }
});
