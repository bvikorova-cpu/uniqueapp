import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible";
import { generateText } from "npm:ai";
import { z } from "npm:zod";
import { enforceRateLimit } from "../_shared/withRateLimit.ts";

const BodySchema = z.object({
  type: z.enum(["rarity_prediction", "box_strategy"]),
});

const COSTS: Record<z.infer<typeof BodySchema>["type"], number> = {
  rarity_prediction: 10,
  box_strategy: 8,
};

type UserSummary = {
  boxesPurchased: number;
  boxesOpened: number;
  activeRewards: number;
  rarityCounts: Record<string, number>;
  recentRewards: string[];
  availableBoxes: Array<{ name: string; price: number; itemCount: number; topRarity: string }>;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal error";
}

function normalizeJoinedRow<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function topRarity(items: Array<{ rarity?: string | null }>): string {
  const rank: Record<string, number> = { common: 1, rare: 2, epic: 3, legendary: 4 };
  return items.reduce((best, item) => {
    const rarity = item.rarity ?? "common";
    return (rank[rarity] ?? 0) > (rank[best] ?? 0) ? rarity : best;
  }, "common");
}

async function loadUserSummary(supabase: ReturnType<typeof createClient>, userId: string): Promise<UserSummary> {
  const [boxesRes, rewardsRes, boxesCatalogRes, itemsCatalogRes] = await Promise.all([
    supabase
      .from("user_mystery_boxes")
      .select("id,is_opened,purchased_at,box_id,mystery_boxes(name,price)")
      .eq("user_id", userId)
      .order("purchased_at", { ascending: false })
      .limit(200),
    supabase
      .from("mystery_box_rewards")
      .select("is_active,received_at,expires_at,mystery_box_items(item_name,item_type,rarity,drop_chance)")
      .eq("user_id", userId)
      .order("received_at", { ascending: false })
      .limit(200),
    supabase
      .from("mystery_boxes")
      .select("id,name,price")
      .order("price", { ascending: true }),
    supabase
      .from("mystery_box_items")
      .select("box_id,item_name,item_type,rarity,drop_chance"),
  ]);

  if (boxesRes.error) throw boxesRes.error;
  if (rewardsRes.error) throw rewardsRes.error;
  if (boxesCatalogRes.error) throw boxesCatalogRes.error;
  if (itemsCatalogRes.error) throw itemsCatalogRes.error;

  const boxes = (boxesRes.data ?? []) as Array<{ is_opened?: boolean | null }>;
  const rewards = (rewardsRes.data ?? []) as Array<{
    is_active?: boolean | null;
    mystery_box_items?: { item_name?: string | null; item_type?: string | null; rarity?: string | null } | Array<{ item_name?: string | null; item_type?: string | null; rarity?: string | null }> | null;
  }>;
  const catalogBoxes = (boxesCatalogRes.data ?? []) as Array<{ id: string; name: string; price: number }>;
  const catalogItems = (itemsCatalogRes.data ?? []) as Array<{ box_id: string; rarity?: string | null }>;

  const rarityCounts = rewards.reduce<Record<string, number>>((acc, reward) => {
    const item = normalizeJoinedRow(reward.mystery_box_items);
    const rarity = item?.rarity ?? "common";
    acc[rarity] = (acc[rarity] ?? 0) + 1;
    return acc;
  }, {});

  const recentRewards = rewards.slice(0, 12).map((reward) => {
    const item = normalizeJoinedRow(reward.mystery_box_items);
    return `${item?.item_name ?? "Unknown reward"} (${item?.rarity ?? "common"})`;
  });

  const availableBoxes = catalogBoxes.map((box) => {
    const items = catalogItems.filter((item) => item.box_id === box.id);
    return {
      name: box.name,
      price: box.price,
      itemCount: items.length,
      topRarity: topRarity(items),
    };
  });

  return {
    boxesPurchased: boxes.length,
    boxesOpened: boxes.filter((box) => box.is_opened).length,
    activeRewards: rewards.filter((reward) => reward.is_active).length,
    rarityCounts,
    recentRewards,
    availableBoxes,
  };
}

function buildPrompt(type: z.infer<typeof BodySchema>["type"], summary: UserSummary): string {
  const format = type === "rarity_prediction"
    ? "Create a full prediction report with drop-rate interpretation, luck pattern assessment, risk notes, recommended next 3 box choices, and budget discipline."
    : "Create a concise strategy guide with the best next box choice, when to stop, and how to protect credits.";

  return `${format}

Use only the data below. Do not pretend to know hidden odds beyond configured drop chances.

User mystery box data:
- Boxes purchased: ${summary.boxesPurchased}
- Boxes opened: ${summary.boxesOpened}
- Active rewards: ${summary.activeRewards}
- Reward rarity counts: ${JSON.stringify(summary.rarityCounts)}
- Recent rewards: ${summary.recentRewards.length ? summary.recentRewards.join(", ") : "No rewards yet"}

Available boxes:
${summary.availableBoxes.map((box) => `- ${box.name}: ${box.price} credits, ${box.itemCount} configured items, highest configured rarity: ${box.topRarity}`).join("\n")}

Return professional, specific guidance in English. Keep it useful for a paying user. Mention that mystery boxes are chance-based and no result is guaranteed.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) return json({ error: "Lovable AI is not configured" }, 500);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const authClient = createClient(supabaseUrl, anonKey);
    const admin = createClient(supabaseUrl, serviceKey || anonKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await authClient.auth.getUser(token);
    const user = userData.user;
    if (authError || !user) return json({ error: "Not authenticated" }, 401);

    const rateLimit = await enforceRateLimit(
      user.id,
      admin,
      { bucket: "ai.mystery_box", max: 10, windowSec: 60 },
      corsHeaders,
    );
    if (rateLimit) return rateLimit;

    const cost = COSTS[parsed.data.type];
    const { data: creditRow, error: creditError } = await admin
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    if (creditError) throw creditError;

    const remaining = creditRow?.credits_remaining ?? 0;
    if (remaining < cost) {
      return json({
        error: `Insufficient AI credits. Need ${cost}, have ${remaining}.`,
        creditsRequired: cost,
        creditsRemaining: remaining,
      }, 402);
    }

    const summary = await loadUserSummary(admin, user.id);
    const gateway = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: { "Lovable-API-Key": lovableApiKey },
    });

    const { text } = await generateText({
      model: gateway("google/gemini-3.6-flash"),
      system: "You are Unique's premium AI rarity strategist for mystery boxes. Give honest, data-grounded advice. Never guarantee gambling/chance outcomes.",
      prompt: buildPrompt(parsed.data.type, summary),
    });

    const { data: deducted, error: deductError } = await admin.rpc("deduct_ai_credits", {
      p_user_id: user.id,
      p_amount: cost,
      p_reason: `mystery_box_${parsed.data.type}`,
      p_source: "mystery-box-ai",
    });
    if (deductError || deducted !== true) {
      return json({ error: "Credit deduction failed. Please retry." }, 402);
    }

    await admin.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: `mystery_box_${parsed.data.type}`,
      credits_used: cost,
      description: `Mystery Box AI: ${parsed.data.type}`,
    });

    return json({ prediction: text, result: text, creditsUsed: cost });
  } catch (error) {
    console.error("mystery-box-ai error:", error);
    return json({ error: getErrorMessage(error) }, 500);
  }
});