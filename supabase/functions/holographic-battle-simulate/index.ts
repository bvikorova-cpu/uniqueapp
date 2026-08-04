// Deterministic PvP battle simulation for Holographic Avatars.
// Server-side outcome is unlocked ONLY after a verified purchase
// (holographic_purchases row with matching stripe_session_id OR an active
// 'battle'-tier subscription for this user). Identical (user, session, mode)
// inputs always yield the same result — no client-side RNG.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const OPPONENTS = [
  { name: "NeonWraith", power: 245 },
  { name: "CrystalSage", power: 238 },
  { name: "ShadowKing", power: 231 },
  { name: "CosmicVoid", power: 227 },
  { name: "BioHunter", power: 220 },
];

const PRIZES: Record<string, number> = { "1v1": 3.5, tournament: 30, survival: 15 };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

// Deterministic RNG seeded by SHA-256 of the inputs. Returns a stream of
// uniform floats in [0,1) by walking 32-bit chunks of repeated hash output.
async function makeSeededRng(seed: string) {
  let counter = 0;
  let buf = new Uint8Array(0);
  let offset = 0;
  const refill = async () => {
    const enc = new TextEncoder().encode(`${seed}|${counter++}`);
    const digest = await crypto.subtle.digest("SHA-256", enc);
    buf = new Uint8Array(digest);
    offset = 0;
  };
  return async () => {
    if (offset + 4 > buf.length) await refill();
    const n =
      (buf[offset] << 24) | (buf[offset + 1] << 16) | (buf[offset + 2] << 8) | buf[offset + 3];
    offset += 4;
    return ((n >>> 0) % 1_000_000) / 1_000_000;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const auth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await auth.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const mode = String(body?.mode ?? "1v1");
    const sessionId = body?.sessionId ? String(body.sessionId) : null;

    const admin = createClient(supabaseUrl, serviceKey);

    // ---- Avatar image generation mode (credits already spent client-side) ----
    if (mode === "avatar_image") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY missing" }, 500);

      const STYLE_PROMPTS: Record<string, string> = {
        cyber: "neon cyberpunk holographic avatar, glowing cyan and magenta rim light, futuristic visor, volumetric light rays",
        mystic: "ancient ethereal mystic being, glowing runes, soft golden aura, translucent holographic shimmer",
        cosmic: "cosmic space-born entity, nebula skin, starfield glow, iridescent holographic particles",
        nature: "bio-organic living holographic being made of glowing flora, vines and luminous leaves, emerald light",
        crystal: "crystalline light form, prismatic refractions, faceted translucent body, icy blue-violet glow",
        shadow: "dark matter construct, shadow silhouette with violet edge glow, smoky holographic wisps",
      };
      const name = String(body?.name ?? "Avatar");
      const style = String(body?.style ?? "cyber").toLowerCase();
      const traits: string[] = Array.isArray(body?.traits) ? body.traits.map(String) : [];
      const prompt =
        `Holographic 3D avatar portrait of a character named "${name}". ` +
        `${STYLE_PROMPTS[style] ?? STYLE_PROMPTS.cyber}. ` +
        `Personality expressed through pose and expression: ${traits.join(", ") || "bold, creative"}. ` +
        `Centered bust portrait, dark background, glowing holographic scanlines, highly detailed, square 1:1.`;

      const extractImage = (d: any): string | null => {
        const b64 = d?.data?.[0]?.b64_json;
        if (typeof b64 === "string" && b64) return `data:image/png;base64,${b64}`;
        const url = d?.data?.[0]?.url;
        if (typeof url === "string" && url) return url;
        const msg = d?.choices?.[0]?.message;
        const fromImages = msg?.images?.[0]?.image_url?.url || msg?.images?.[0]?.url;
        if (typeof fromImages === "string" && fromImages) return fromImages;
        return null;
      };

      let imageData: string | null = null;
      let lastErr = "";
      for (const model of ["google/gemini-3.1-flash-image", "google/gemini-2.5-flash-image"]) {
        const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
          method: "POST",
          headers: { "Lovable-API-Key": LOVABLE_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        });
        if (!res.ok) {
          lastErr = `${model}: ${res.status} ${await res.text()}`;
          console.error("avatar image gen failed", lastErr);
          continue;
        }
        imageData = extractImage(await res.json());
        if (imageData) break;
        lastErr = `${model}: no image in response`;
      }
      if (!imageData) return json({ error: `Image generation failed. ${lastErr}` }, 500);

      let publicUrl = imageData;
      if (imageData.startsWith("data:")) {
        const base64 = imageData.split(",")[1] ?? "";
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const path = `${user.id}/holographic/${crypto.randomUUID()}.png`;
        const { error: upErr } = await admin.storage
          .from("animated-avatars")
          .upload(path, bytes, { contentType: "image/png", upsert: true });
        if (!upErr) {
          publicUrl = admin.storage.from("animated-avatars").getPublicUrl(path).data.publicUrl;
        } else {
          console.error("avatar upload failed", upErr);
        }
      }

      const { data: row, error: insErr } = await admin
        .from("holographic_avatars")
        .insert({ user_id: user.id, name, style, traits, image_url: publicUrl })
        .select()
        .maybeSingle();
      if (insErr) console.error("avatar insert failed", insErr);

      return json({ imageUrl: publicUrl, avatar: row ?? null });
    }


    // 1) Cache: same session → same result, never re-simulate.
    if (sessionId) {
      const { data: existing } = await admin
        .from("holographic_battle_results")
        .select("*")
        .eq("stripe_session_id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (existing) return json({ result: existing, cached: true });
    }

    // 2) Verify purchase / subscription before unlocking outcome.
    let purchaseOk = false;
    if (sessionId) {
      const { data: purchase } = await admin
        .from("holographic_purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("stripe_session_id", sessionId)
        .eq("status", "active")
        .maybeSingle();
      purchaseOk = !!purchase;
    }
    if (!purchaseOk) {
      const { data: sub } = await admin
        .from("holographic_purchases")
        .select("id, expires_at")
        .eq("user_id", user.id)
        .eq("service_type", "battle")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      purchaseOk = !!sub && (!sub.expires_at || new Date(sub.expires_at) > new Date());
    }
    if (!purchaseOk) {
      return json({ error: "purchase_required", message: "Active battle purchase required." }, 402);
    }

    // 3) Deterministic outcome from (user, session, mode).
    const rng = await makeSeededRng(`battle|${user.id}|${sessionId ?? "no-session"}|${mode}`);
    const userPower = 180 + Math.floor((await rng()) * 100);
    const opponent = OPPONENTS[Math.floor((await rng()) * OPPONENTS.length)];
    const diff = userPower - opponent.power;
    let outcome: "win" | "loss" | "draw";
    if (diff > 10) outcome = "win";
    else if (diff < -10) outcome = "loss";
    else outcome = (await rng()) > 0.5 ? "win" : "loss";

    const rewards = outcome === "win" ? PRIZES[mode] ?? 0 : 0;

    const { data: result, error } = await admin
      .from("holographic_battle_results")
      .insert({ user_id: user.id,
        mode,
        opponent_name: opponent.name,
        outcome,
        user_power: userPower,
        opponent_power: opponent.power,
        rewards_eur: rewards,
        stripe_session_id: sessionId })
      .select()
      .single();
    if (error) throw error;

    return json({ result });
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
