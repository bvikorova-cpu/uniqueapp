import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { deductAICredits, refundAICredits } from "../_shared/credits.ts";
import { callUnifiedAI, generateOpenAIImage } from "../_shared/unifiedAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST = 30;

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function repairJson(text: string) {
  const cleaned = String(text).replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  try {
    return JSON.parse(slice);
  } catch {
    return {};
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
    const character1Id = String(body?.character1Id ?? "").trim();
    const character2Id = String(body?.character2Id ?? "").trim();
    if (!character1Id || !character2Id || character1Id === character2Id) {
      return j({ error: "Two different warriors are required for fusion" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: parents, error: parentsErr } = await admin
      .from("characters")
      .select("id, name, category, description, backstory, hp, attack, defense, speed, level, is_premium")
      .in("id", [character1Id, character2Id])
      .eq("user_id", user.id);
    if (parentsErr) return j({ error: "Could not load the selected warriors" }, 400);
    const p1 = parents?.find((c) => c.id === character1Id);
    const p2 = parents?.find((c) => c.id === character2Id);
    if (!p1 || !p2) return j({ error: "Both warriors must belong to you" }, 404);

    const denied = await deductAICredits(user.id, COST, "character_fusion");
    if (denied) return denied;

    try {
      const raw = await callUnifiedAI(
        [
          {
            role: "system",
            content:
              "You are a comic-book and game designer who merges two battle characters into one original hybrid. Keep everything 100% original — never reuse trademarked Marvel/DC names, logos or origin stories. Reply with strict JSON only.",
          },
          {
            role: "user",
            content: `Fuse these two warriors into ONE new hybrid warrior.

Warrior A: name "${p1.name}", category ${p1.category ?? "warrior"}, HP ${p1.hp}, ATK ${p1.attack}, DEF ${p1.defense}, SPD ${p1.speed}. ${String(p1.description ?? "").slice(0, 300)}
Warrior B: name "${p2.name}", category ${p2.category ?? "warrior"}, HP ${p2.hp}, ATK ${p2.attack}, DEF ${p2.defense}, SPD ${p2.speed}. ${String(p2.description ?? "").slice(0, 300)}

Return JSON:
{"name":"a new fused hero name (2-3 words, clearly inspired by both parents)","category":"one word archetype","title":"short epic epithet","backstory":"5-7 vivid sentences explaining how the two warriors merged and what the hybrid became","appearance":"one vivid sentence describing looks, costume/armor, weapon, colors","signature_ability":{"name":"ability name","desc":"one sentence"},"inherited":{"from_a":"trait inherited from Warrior A","from_b":"trait inherited from Warrior B"},"weakness":"one sentence","stats":{"hp":number,"attack":number,"defense":number,"speed":number}}`,
          },
        ],
        { max_tokens: 1600, json: true },
      );

      const text = typeof raw === "string" ? raw : (raw?.content ?? raw?.text ?? "");
      const parsed = repairJson(text);

      // Fusion stats: best of both parents + 15% fusion bonus, never weaker than a parent.
      const fuse = (a: number, b: number, aiVal: unknown) => {
        const base = Math.round(Math.max(Number(a) || 0, Number(b) || 0) * 1.15 + Math.min(Number(a) || 0, Number(b) || 0) * 0.15);
        const ai = Number(aiVal);
        return Math.max(base, Number.isFinite(ai) ? Math.round(ai) : 0);
      };
      const stats = {
        hp: fuse(p1.hp, p2.hp, parsed?.stats?.hp),
        attack: fuse(p1.attack, p2.attack, parsed?.stats?.attack),
        defense: fuse(p1.defense, p2.defense, parsed?.stats?.defense),
        speed: fuse(p1.speed, p2.speed, parsed?.stats?.speed),
      };

      const name = String(parsed?.name ?? "").trim().slice(0, 80) || `${String(p1.name).slice(0, 6)}-${String(p2.name).slice(0, 6)}`;
      const category = String(parsed?.category ?? p1.category ?? "hybrid").trim().slice(0, 40);
      const appearance = String(parsed?.appearance ?? "").slice(0, 400);
      const backstory = String(parsed?.backstory ?? `${name} was born when ${p1.name} and ${p2.name} merged in the fusion chamber.`).slice(0, 3000);

      // Portrait (best effort — fusion still succeeds without an image)
      let imageUrl: string | null = null;
      try {
        const img = await generateOpenAIImage(
          `Original hybrid battle hero portrait of "${name}", a fusion of a ${p1.category ?? "warrior"} and a ${p2.category ?? "warrior"}. ${appearance}. Fused dual-nature design, glowing fusion energy seams, dramatic cinematic lighting, dynamic heroic pose, highly detailed digital painting, full upper body, vivid colors, game character art. Completely original design — no trademarked hero, logo, emblem or celebrity likeness. No text, no watermark.`,
          "1024x1024",
        );
        const b64 = img.b64_json;
        if (b64) {
          const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          const path = `characters/${user.id}/fusion-${Date.now()}.png`;
          const { error: upErr } = await admin.storage.from("ai-studio")
            .upload(path, bytes, { contentType: "image/png", upsert: true });
          if (upErr) throw upErr;
          imageUrl = admin.storage.from("ai-studio").getPublicUrl(path).data.publicUrl;
        } else if (img.url) {
          imageUrl = img.url;
        }
      } catch (imgErr) {
        console.error("[fuse-characters] portrait failed", imgErr);
      }

      const description = [
        `Fusion of ${p1.name} + ${p2.name}.`,
        parsed?.title ? `Title: ${parsed.title}.` : "",
        appearance,
      ].filter(Boolean).join(" ").slice(0, 1000);

      const { data: created, error: insErr } = await admin.from("characters").insert({
        user_id: user.id,
        name,
        category,
        description,
        backstory,
        image_url: imageUrl,
        hp: stats.hp,
        attack: stats.attack,
        defense: stats.defense,
        speed: stats.speed,
        level: Math.max(Number(p1.level) || 1, Number(p2.level) || 1),
        is_premium: !!(p1.is_premium || p2.is_premium),
      }).select("id").single();
      if (insErr) throw insErr;

      const power = stats.hp + stats.attack + stats.defense + stats.speed;

      return j({
        id: created.id,
        name,
        category,
        title: parsed?.title ?? "Hybrid Warrior",
        imageUrl,
        backstory,
        appearance,
        stats,
        power,
        rarity: power > 900 ? "legendary" : power > 600 ? "epic" : "rare",
        signatureAbility: parsed?.signature_ability ?? null,
        inherited: parsed?.inherited ?? null,
        weakness: parsed?.weakness ?? null,
        parents: [
          { id: p1.id, name: p1.name, category: p1.category, hp: p1.hp, attack: p1.attack, defense: p1.defense, speed: p1.speed },
          { id: p2.id, name: p2.name, category: p2.category, hp: p2.hp, attack: p2.attack, defense: p2.defense, speed: p2.speed },
        ],
        creditsUsed: COST,
      });
    } catch (err) {
      await refundAICredits(user.id, COST, "character_fusion");
      console.error("[fuse-characters] failed", err);
      return j({ error: "The fusion failed — your credits were refunded. Please try again." }, 502);
    }
  } catch (e) {
    return j({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
