// Coloring Hub universal router — handles all 18 features.
// AI actions deduct credits from coloring_credits.
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST: Record<string, number> = {
  "ai.colorByNumber": 5,
  "ai.palette": 3,
  "ai.example": 3,
  "ai.recolor": 4,
};

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callAI(prompt: string, system?: string) {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY missing");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: prompt },
      ],
    }),
  });
  if (res.status === 429) throw new Error("rate_limited");
  if (res.status === 402) throw new Error("credits_exhausted");
  if (!res.ok) throw new Error("ai_failed");
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function deductCredits(supabase: any, userId: string, cost: number) {
  const { data: row } = await supabase
    .from("coloring_credits")
    .select("credits_remaining")
    .eq("user_id", userId)
    .maybeSingle();
  const balance = row?.credits_remaining ?? 0;
  if (balance < cost) throw new Error("insufficient_credits");
  await supabase
    .from("coloring_credits")
    .update({ credits_remaining: balance - cost })
    .eq("user_id", userId);
}

async function bumpStreak(supabase: any, userId: string, xpGain = 10) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: cur } = await supabase
    .from("coloring_streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  let current = 1;
  let longest = 1;
  let xp = xpGain;
  let level = 1;
  let badges: any[] = [];
  if (cur) {
    const last = cur.last_painted_on as string | null;
    if (last === today) {
      current = cur.current_streak;
    } else {
      const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      current = last === y ? cur.current_streak + 1 : 1;
    }
    longest = Math.max(cur.longest_streak ?? 0, current);
    xp = (cur.xp ?? 0) + xpGain;
    level = Math.max(1, Math.floor(xp / 100) + 1);
    badges = cur.badges ?? [];
    if (current === 7 && !badges.includes("week_warrior")) badges.push("week_warrior");
    if (current === 30 && !badges.includes("month_master")) badges.push("month_master");
    await supabase.from("coloring_streaks").update({
      current_streak: current,
      longest_streak: longest,
      last_painted_on: today,
      xp,
      level,
      badges,
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId);
  } else {
    await supabase.from("coloring_streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_painted_on: today,
      xp,
      level,
      badges,
    });
  }
  return { current_streak: current, longest_streak: longest, xp, level, badges };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE);

    const { data: { user } } = await userClient.auth.getUser();
    const body = await req.json().catch(() => ({}));
    const action = body.action as string;

    // Public actions (no auth required)
    if (action === "contests.list") {
      const { data } = await admin.from("coloring_contests").select("*").eq("is_active", true).order("ends_at");
      return json({ contests: data ?? [] });
    }
    if (action === "collections.list") {
      const { data } = await admin.from("coloring_collections").select("*").order("created_at", { ascending: false });
      return json({ collections: data ?? [] });
    }
    if (action === "collections.items") {
      const { data } = await admin.from("coloring_collection_items").select("*").eq("collection_id", body.collection_id);
      return json({ items: data ?? [] });
    }
    if (action === "feed.public") {
      const { data } = await admin
        .from("coloring_artworks")
        .select("id,user_id,title,image_url,thumb_url,likes_count,remix_of,license,created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(60);
      return json({ artworks: data ?? [] });
    }
    if (action === "collab.join") {
      const { data } = await admin.from("coloring_collabs").select("*").eq("invite_token", body.token).maybeSingle();
      if (!data) return json({ error: "not_found" }, 404);
      return json({ collab: data });
    }

    if (!user) return json({ error: "unauthorized" }, 401);

    // ===== Auth-gated actions =====
    const cost = COST[action] ?? 0;
    if (cost > 0) await deductCredits(admin, user.id, cost);

    switch (action) {
      // 1. Color-by-number (AI)
      case "ai.colorByNumber": {
        const guide = await callAI(
          `Generate a numbered colour map for an outline titled "${body.title ?? "image"}". Return JSON: { zones: [{ id, color_hex, label }] } with 8-16 zones.`,
          "You output ONLY valid compact JSON."
        );
        let parsed: any = {};
        try { parsed = JSON.parse(guide.replace(/```json|```/g, "").trim()); } catch { parsed = { zones: [] }; }
        return json({ ok: true, ...parsed });
      }
      // 2. Paint-bucket / 3. brushes / 4. mandala / 5. layers / 7. zoom-stylus
      //    — handled fully client-side; backend just saves resulting artwork.
      case "artwork.save": {
        const insert = {
          user_id: user.id,
          title: body.title ?? null,
          image_url: body.image_url,
          thumb_url: body.thumb_url ?? null,
          source_template_url: body.source_template_url ?? null,
          palette: body.palette ?? [],
          brush_data: body.brush_data ?? {},
          time_lapse: body.time_lapse ?? [],
          is_public: !!body.is_public,
          remix_of: body.remix_of ?? null,
          contest_id: body.contest_id ?? null,
          license: body.license ?? "original",
        };
        const { data, error } = await admin.from("coloring_artworks").insert(insert).select().single();
        if (error) throw error;
        const streak = await bumpStreak(admin, user.id, 10);
        return json({ artwork: data, streak });
      }
      case "artwork.list": {
        const { data } = await admin.from("coloring_artworks").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
        return json({ artworks: data ?? [] });
      }
      // 6. Smart palettes (AI)
      case "ai.palette": {
        const out = await callAI(
          `Return JSON { name, colors:[hex...] } for a palette named "${body.preset ?? "Pantone Spring"}" with 6 swatches.`,
          "You output ONLY valid compact JSON."
        );
        let parsed: any = {};
        try { parsed = JSON.parse(out.replace(/```json|```/g, "").trim()); } catch { parsed = { name: "Palette", colors: [] }; }
        return json({ ok: true, ...parsed });
      }
      // 8. Streaks
      case "streak.get": {
        const { data } = await admin.from("coloring_streaks").select("*").eq("user_id", user.id).maybeSingle();
        return json({ streak: data });
      }
      // 9. Contests
      case "contest.submit": {
        await admin.from("coloring_artworks").update({ contest_id: body.contest_id, is_public: true }).eq("id", body.artwork_id).eq("user_id", user.id);
        return json({ ok: true });
      }
      case "contest.entries": {
        const { data } = await admin.from("coloring_artworks").select("*").eq("contest_id", body.contest_id).eq("is_public", true).order("likes_count", { ascending: false });
        return json({ entries: data ?? [] });
      }
      case "contest.vote": {
        await admin.from("coloring_likes").upsert({ artwork_id: body.artwork_id, user_id: user.id });
        await admin.rpc("noop"); // ignore if missing
        const { data: cur } = await admin.from("coloring_artworks").select("likes_count").eq("id", body.artwork_id).maybeSingle();
        await admin.from("coloring_artworks").update({ likes_count: (cur?.likes_count ?? 0) + 1 }).eq("id", body.artwork_id);
        return json({ ok: true });
      }
      // 10. Time-lapse — saved within artwork.time_lapse, endpoint returns
      case "timelapse.get": {
        const { data } = await admin.from("coloring_artworks").select("time_lapse").eq("id", body.artwork_id).maybeSingle();
        return json({ frames: data?.time_lapse ?? [] });
      }
      // 11. Follow feed
      case "follow.toggle": {
        const { data: exist } = await admin.from("coloring_follows").select("*").eq("follower_id", user.id).eq("followee_id", body.followee_id).maybeSingle();
        if (exist) {
          await admin.from("coloring_follows").delete().eq("follower_id", user.id).eq("followee_id", body.followee_id);
          return json({ following: false });
        }
        await admin.from("coloring_follows").insert({ follower_id: user.id, followee_id: body.followee_id });
        return json({ following: true });
      }
      case "feed.following": {
        const { data: follows } = await admin.from("coloring_follows").select("followee_id").eq("follower_id", user.id);
        const ids = (follows ?? []).map((r: any) => r.followee_id);
        if (!ids.length) return json({ artworks: [] });
        const { data } = await admin.from("coloring_artworks").select("*").in("user_id", ids).eq("is_public", true).order("created_at", { ascending: false }).limit(60);
        return json({ artworks: data ?? [] });
      }
      // 12. Remix
      case "remix.start": {
        const { data: src } = await admin.from("coloring_artworks").select("source_template_url,title").eq("id", body.artwork_id).maybeSingle();
        return json({ source_template_url: src?.source_template_url ?? null, title: `Remix of ${src?.title ?? "artwork"}`, remix_of: body.artwork_id });
      }
      // 13. Collab
      case "collab.create": {
        const { data, error } = await admin.from("coloring_collabs").insert({ host_id: user.id, artwork_id: body.artwork_id ?? null }).select().single();
        if (error) throw error;
        return json({ collab: data });
      }
      case "collab.push": {
        const { data: cur } = await admin.from("coloring_collabs").select("strokes").eq("id", body.collab_id).maybeSingle();
        const next = [...((cur?.strokes as any[]) ?? []), { user_id: user.id, ...body.stroke, at: Date.now() }];
        await admin.from("coloring_collabs").update({ strokes: next }).eq("id", body.collab_id);
        return json({ ok: true });
      }
      // 14. Collections handled in public actions
      // 15. Licensed IP packs — purchase
      case "collection.unlock": {
        const { data: col } = await admin.from("coloring_collections").select("price_credits,is_premium").eq("id", body.collection_id).maybeSingle();
        if (!col) return json({ error: "not_found" }, 404);
        if (col.is_premium && (col.price_credits ?? 0) > 0) {
          await deductCredits(admin, user.id, col.price_credits!);
        }
        const { data: items } = await admin.from("coloring_collection_items").select("*").eq("collection_id", body.collection_id);
        return json({ unlocked: true, items: items ?? [] });
      }
      // 16. AI examples (paid)
      case "ai.example": {
        const out = await callAI(
          `Suggest 4 stunning colour combinations for an outline themed "${body.theme ?? "garden"}". Return JSON: { examples:[{ name, colors:[hex...] }] }`,
          "You output ONLY valid compact JSON."
        );
        let parsed: any = {};
        try { parsed = JSON.parse(out.replace(/```json|```/g, "").trim()); } catch { parsed = { examples: [] }; }
        return json({ ok: true, ...parsed });
      }
      // 17. Mindfulness — config returned
      case "mindfulness.tracks": {
        return json({
          tracks: [
            { id: "rain", name: "Rain & thunder", url: "https://cdn.pixabay.com/audio/2022/03/15/audio_0625c1539c.mp3" },
            { id: "ocean", name: "Ocean waves", url: "https://cdn.pixabay.com/audio/2022/10/20/audio_b9b3a7c6bf.mp3" },
            { id: "forest", name: "Forest birds", url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" },
            { id: "lofi", name: "Lo-fi calm", url: "https://cdn.pixabay.com/audio/2022/03/24/audio_07b2a04be3.mp3" },
          ],
        });
      }
      // 18. Print-on-demand — checkout
      case "pod.checkout": {
        const { data: order, error } = await admin.from("coloring_pod_orders").insert({
          user_id: user.id,
          artwork_id: body.artwork_id ?? null,
          product_type: body.product_type,
          amount_eur: body.amount_eur ?? 1900,
          status: "pending",
        }).select().single();
        if (error) throw error;
        // Reuse generic create-checkout for credits/products
        const { data: chk, error: chkErr } = await admin.functions.invoke("create-checkout", {
          body: { product_type: "coloring_pod", order_id: order.id, amount_eur: order.amount_eur },
        });
        if (chkErr) return json({ order, checkout_url: null, warning: "Configure POD checkout in create-checkout" });
        return json({ order, checkout_url: chk?.url ?? null });
      }
      case "pod.orders": {
        const { data } = await admin.from("coloring_pod_orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
        return json({ orders: data ?? [] });
      }
      // AI recolor (paid)
      case "ai.recolor": {
        const out = await callAI(
          `Suggest a recoloured palette for theme "${body.mood ?? "sunset"}". JSON { colors:[hex...] }`,
          "You output ONLY valid compact JSON."
        );
        let parsed: any = {};
        try { parsed = JSON.parse(out.replace(/```json|```/g, "").trim()); } catch { parsed = { colors: [] }; }
        return json({ ok: true, ...parsed });
      }
      default:
        return json({ error: "unknown_action", action }, 400);
    }
  } catch (e: any) {
    const msg = e?.message ?? "internal_error";
    const status = msg === "insufficient_credits" ? 402 : msg === "unauthorized" ? 401 : 500;
    return json({ error: msg }, status);
  }
});
