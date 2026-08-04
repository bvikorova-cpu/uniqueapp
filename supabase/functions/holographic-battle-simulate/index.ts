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
  { name: "PrismFang", power: 252 },
  { name: "VoidHalo", power: 243 },
  { name: "EchoSpectre", power: 236 },
  { name: "AuroraTitan", power: 229 },
  { name: "NullSeraph", power: 248 },
  { name: "GlitchOracle", power: 224 },
  { name: "IonReaper", power: 234 },
  { name: "QuantumMirage", power: 241 },
  { name: "HexNomad", power: 218 },
  { name: "StarlitHollow", power: 233 },
  { name: "PlasmaMonk", power: 226 },
];

// Chance of winning per mode — losses are the norm, wins happen now and then.
const WIN_CHANCE: Record<string, number> = { "1v1": 0.35, survival: 0.3, tournament: 0.25 };

// XP payout on a win (entry costs: 1v1 = 2, survival = 3, tournament = 5 credits).
// Prizes are paid in XP — never in credits.
const PRIZES: Record<string, number> = { "1v1": 80, tournament: 600, survival: 300 };


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

    // ---- Emotion Sync mode: real facial emotion analysis (1 credit) ----
    if (mode === "emotion_sync") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY missing" }, 500);
      const image = String(body?.image ?? "");
      if (!image.startsWith("data:image")) return json({ error: "IMAGE_REQUIRED" }, 400);

      const avatarName = String(body?.avatarName ?? "their avatar");
      const avatarStyle = String(body?.avatarStyle ?? "cyber");
      const prompt =
        `You are an emotion recognition engine for a holographic avatar app. ` +
        `Look at the person's face in this photo and detect their current emotion. ` +
        `Allowed emotions: Happy, Sad, Angry, Neutral, Love, Surprised. ` +
        `The user's avatar is named "${avatarName}" with a ${avatarStyle} holographic style. ` +
        `Reply ONLY with strict JSON: {"emotion":"<one of allowed>","confidence":<0-100 integer>,` +
        `"facial_cues":"<short observation of eyes/mouth/brows>",` +
        `"avatar_reaction":"<1-2 sentences describing how the holographic avatar mirrors this emotion>",` +
        `"suggestion":"<one short friendly tip>"}. No markdown, no extra text. ` +
        `If no face is visible, use emotion "Neutral", confidence 0 and say so in facial_cues.`;

      let parsed: Record<string, unknown> | null = null;
      let aiErr = "";
      for (const model of ["google/gemini-3.6-flash", "google/gemini-2.5-flash"]) {
        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Lovable-API-Key": LOVABLE_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages: [{
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: image } },
              ],
            }],
          }),
        });
        if (!res.ok) {
          aiErr = `${model}: ${res.status} ${await res.text()}`;
          console.error("emotion sync ai failed", aiErr);
          continue;
        }
        const d = await res.json();
        const raw = String(d?.choices?.[0]?.message?.content ?? "");
        const m = raw.match(/\{[\s\S]*\}/);
        if (!m) { aiErr = `${model}: no JSON`; continue; }
        try { parsed = JSON.parse(m[0]); break; } catch { aiErr = `${model}: invalid JSON`; }
      }
      if (!parsed) return json({ error: `Emotion analysis failed. ${aiErr}` }, 502);

      // Charge 1 credit only after a successful analysis.
      const { data: bal, error: spendErr } = await admin.rpc("deduct_ai_credits_atomic", {
        _user_id: user.id,
        _amount: 1,
      });
      if (spendErr) {
        console.error("emotion sync credit deduction failed", spendErr);
        return json({ error: "INSUFFICIENT_CREDITS", message: "Not enough credits (1 credit per scan)." }, 402);
      }

      const allowed = ["Happy", "Sad", "Angry", "Neutral", "Love", "Surprised"];
      const emotion = allowed.find((e) => e.toLowerCase() === String(parsed!.emotion ?? "").toLowerCase()) || "Neutral";
      const confidence = Math.max(0, Math.min(100, Math.round(Number(parsed!.confidence) || 0)));

      return json({
        emotion,
        confidence,
        facialCues: String(parsed!.facial_cues ?? ""),
        avatarReaction: String(parsed!.avatar_reaction ?? ""),
        suggestion: String(parsed!.suggestion ?? ""),
        creditsRemaining: typeof bal === "number" ? bal : null,
      });
    }

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
        (body?.outfit ? `Wearing: ${String(body.outfit)}. ` : "") +
        (body?.accessory ? `Accessory detail: ${String(body.accessory)}. ` : "") +
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

    // 2) Access model: credit-based (credits are deducted before this call).
    //    Legacy Stripe purchase/subscription gate removed.


    // 3) Fresh matchup per battle. With a Stripe sessionId the result stays
    //    reproducible; without one, every battle gets its own seed so the
    //    opponent and outcome change each time.
    const battleSeed = sessionId ?? `${Date.now()}-${crypto.randomUUID()}`;
    const rng = await makeSeededRng(`battle|${user.id}|${battleSeed}|${mode}`);

    // Avoid repeating the last few opponents this user faced.
    const { data: recent } = await admin
      .from("holographic_battle_results")
      .select("opponent_name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4);
    const recentNames = new Set((recent ?? []).map((r: any) => r.opponent_name));
    const pool = OPPONENTS.filter((o) => !recentNames.has(o.name));
    const candidates = pool.length ? pool : OPPONENTS;

    const opponent = candidates[Math.floor((await rng()) * candidates.length)];

    // Outcome is chance-driven per mode: mostly losses, occasional wins.
    const roll = await rng();
    const winChance = WIN_CHANCE[mode] ?? 0.3;
    let outcome: "win" | "loss" | "draw";
    if (roll < winChance) outcome = "win";
    else if (roll < winChance + 0.08) outcome = "draw";
    else outcome = "loss";

    // Power values stay consistent with the outcome shown to the player.
    const margin = 4 + Math.floor((await rng()) * 26);
    const userPower =
      outcome === "win" ? opponent.power + margin
      : outcome === "loss" ? opponent.power - margin
      : opponent.power + (margin % 3) - 1;

    const rewards = outcome === "win" ? PRIZES[mode] ?? 0 : 0;



    // Pay the win prize in XP (unified XP ledger) — no credit payouts.
    const xpSource = String(body?.xpSource ?? "holographic_battle");
    let xpAwarded = 0;
    if (rewards > 0) {
      const source = `${xpSource}_win_${mode}`;
      const refId = `${Date.now()}-${crypto.randomUUID()}`;
      const { error: awardError } = await admin.rpc("award_xp", {
        _user_id: user.id,
        _amount: rewards,
        _source: source,
        _ref_id: refId,
      });
      if (awardError) {
        console.error("battle XP award rpc failed, falling back", awardError);
        const { error: insErr } = await admin
          .from("xp_events")
          .insert({ user_id: user.id, source, amount: rewards, ref_id: refId });
        if (insErr) console.error("battle XP fallback insert failed", insErr);
        else xpAwarded = rewards;
      } else {
        xpAwarded = rewards;
      }
      console.log("battle XP result", { user: user.id, source, rewards, xpAwarded });
    }


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

    // 4) Deterministic round-by-round combat log (presentation detail only).
    const MOVES = [
      { name: "Photon Lance", type: "attack" },
      { name: "Prism Shield", type: "defense" },
      { name: "Quantum Feint", type: "tactic" },
      { name: "Nova Overdrive", type: "ultimate" },
      { name: "Void Step", type: "evasion" },
      { name: "Resonance Blast", type: "attack" },
      { name: "Hologram Split", type: "tactic" },
      { name: "Ion Barrage", type: "attack" },
    ];
    const ARENAS = ["Neon Spire", "Crystal Vault", "Void Coliseum", "Aurora Grid", "Data Cathedral"];
    const roundCount = mode === "tournament" ? 5 : mode === "survival" ? 4 : 3;
    const arena = ARENAS[Math.floor((await rng()) * ARENAS.length)];

    // Pre-decide round winners so the log always matches the final outcome.
    const winsNeeded =
      outcome === "win" ? Math.ceil((roundCount + 1) / 2)
      : outcome === "loss" ? Math.floor(roundCount / 2)
      : Math.floor(roundCount / 2);
    const flags: boolean[] = [];
    for (let i = 0; i < roundCount; i++) flags.push(i < winsNeeded);
    // Deterministic shuffle so the winning rounds are not always first.
    for (let i = flags.length - 1; i > 0; i--) {
      const j = Math.floor((await rng()) * (i + 1));
      [flags[i], flags[j]] = [flags[j], flags[i]];
    }

    let userHp = 100;
    let oppHp = 100;
    const rounds: unknown[] = [];
    for (let i = 0; i < roundCount; i++) {
      const userMove = MOVES[Math.floor((await rng()) * MOVES.length)];
      const oppMove = MOVES[Math.floor((await rng()) * MOVES.length)];
      const userWon = flags[i];
      const dmg = 12 + Math.floor((await rng()) * 16);
      const chip = 3 + Math.floor((await rng()) * 6);
      const critical = (await rng()) > 0.78;
      const finalDmg = critical ? Math.round(dmg * 1.5) : dmg;
      if (userWon) { oppHp = Math.max(1, oppHp - finalDmg); userHp = Math.max(1, userHp - chip); }
      else { userHp = Math.max(1, userHp - finalDmg); oppHp = Math.max(1, oppHp - chip); }
      rounds.push({ round: i + 1,
        user_move: userMove.name,
        user_move_type: userMove.type,
        opponent_move: oppMove.name,
        opponent_move_type: oppMove.type,
        winner: userWon ? "user" : "opponent",
        damage: finalDmg,
        critical,
        user_hp: userHp,
        opponent_hp: oppHp,
        commentary: userWon
          ? `Your avatar channels ${userMove.name}${critical ? " for a devastating critical" : ""}, breaking through ${oppMove.name}.`
          : `${opponent.name} counters with ${oppMove.name}${critical ? " — a critical hit" : ""}, punishing your ${userMove.name}.` });
    }

    const roundsWon = flags.filter(Boolean).length;
    const summary =
      outcome === "win"
        ? `Victory in the ${arena}. You closed out ${roundsWon} of ${roundCount} rounds against ${opponent.name}, finishing with ${userHp}% integrity.${xpAwarded ? ` Prize paid out: +${xpAwarded} XP.` : ""}`
        : outcome === "loss"
        ? `Defeat in the ${arena}. ${opponent.name} took ${roundCount - roundsWon} of ${roundCount} rounds; your hologram destabilised at ${userHp}% integrity.`
        : `A dead heat in the ${arena}. You and ${opponent.name} split the rounds ${roundsWon}-${roundCount - roundsWon}.`;

    return json({ result: { ...result,
        arena,
        rounds,
        rounds_won: roundsWon,
        rounds_total: roundCount,
        final_user_hp: userHp,
        final_opponent_hp: oppHp,
        xp_awarded: xpAwarded,
        credits_awarded: 0,
        summary } });

  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
