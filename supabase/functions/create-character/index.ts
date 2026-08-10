import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { deductAICredits, refundAICredits } from "../_shared/credits.ts";
import { callUnifiedAI, generateOpenAIImage } from "../_shared/unifiedAI.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

/** Comic-book style categories get a modern superhero-comic art prompt. */
const COMIC_CATEGORIES = ["superhero", "comic hero", "comic villain", "mutant", "cosmic", "villain", "vigilante", "armored hero"];

function isComic(category: string) {
  return COMIC_CATEGORIES.includes(String(category ?? "").toLowerCase());
}

/**
 * Builds the portrait prompt. Comic categories render in the modern
 * American superhero-comic / cinematic style. The characters are always
 * ORIGINAL — no trademarked names, logos, emblems or copyrighted likenesses.
 */
function portraitPrompt(name: string, category: string, visual: string, mood: string) {
  if (isComic(category)) {
    return `Original superhero character portrait of "${name}", a ${category}. ${visual}. ${mood}. Modern American superhero comic-book style: bold inked linework, dynamic anatomy, glossy skin-tight costume with cape or armor plating, energy aura, comic-cinematic key lighting, halftone-free clean render, full upper body, saturated primary colors, splash-page composition. Completely original character design — do NOT copy or resemble any existing Marvel, DC or other trademarked hero, no known logos, emblems, symbols, masks or celebrity likeness. No text, no watermark, no logos.`;
  }
  return `Epic fantasy battle character portrait of "${name}", a ${category} warrior. ${visual}. ${mood}. Highly detailed digital painting, full upper body, vivid colors, game character art. No text, no watermark, no logos.`;
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
    const name = String(body?.name ?? "").trim().slice(0, 80);
    const category = String(body?.category ?? "").trim().slice(0, 40);
    const description = String(body?.description ?? "").trim().slice(0, 1000);
    const isPremium = !!body?.isPremium;
    const action = String(body?.action ?? "create");
    const characterId = String(body?.characterId ?? "").trim();
    const existingDescription = String(body?.existingDescription ?? "").trim().slice(0, 400);

    const variantCount = Math.min(4, Math.max(2, Number(body?.variantCount ?? 3)));
    const chosenImageUrl = String(body?.imageUrl ?? "").trim();

    const admin0 = () => createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // ── Set an already generated variant as the main portrait (free) ───────
    if (action === "set_portrait") {
      if (!characterId || !chosenImageUrl) return j({ error: "Character id and image are required" }, 400);
      const admin = admin0();
      const { error: updErr } = await admin.from("characters")
        .update({ image_url: chosenImageUrl }).eq("id", characterId).eq("user_id", user.id);
      if (updErr) return j({ error: "Could not update the portrait" }, 400);
      return j({ imageUrl: chosenImageUrl, creditsUsed: 0 });
    }

    // ── Generate multiple portrait variants (3 credits each) ───────────────
    if (action === "portrait_variants") {
      if (!characterId || !name) return j({ error: "Character id and name are required" }, 400);
      const admin = admin0();
      const { data: charRow } = await admin.from("characters")
        .select("description, category").eq("id", characterId).eq("user_id", user.id).maybeSingle();
      if (!charRow) return j({ error: "Character not found" }, 404);

      const costV = 3 * variantCount;
      const deniedV = await deductAICredits(user.id, costV, "character_portrait_variants");
      if (deniedV) return deniedV;

      const visual = existingDescription || String(charRow.description ?? "").slice(0, 400);
      const moods = [
        "heroic frontal pose, warm rim lighting",
        "dramatic three-quarter view, cold moody lighting",
        "low-angle power stance, glowing energy effects",
        "close-up intense portrait, cinematic shadows",
      ];
      const urls: string[] = [];
      for (let i = 0; i < variantCount; i++) {
        try {
          const img = await generateOpenAIImage(
            `Epic fantasy battle character portrait of "${name}", a ${charRow.category ?? category} warrior. ${visual}. ${moods[i % moods.length]}. Highly detailed digital painting, full upper body, vivid colors, game character art. No text, no watermark, no logos.`,
            "1024x1024",
          );
          const b64 = img.b64_json;
          if (b64) {
            const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
            const path = `characters/${user.id}/${Date.now()}-v${i}.png`;
            const { error: upErr } = await admin.storage.from("ai-studio")
              .upload(path, bytes, { contentType: "image/png", upsert: true });
            if (upErr) throw upErr;
            urls.push(admin.storage.from("ai-studio").getPublicUrl(path).data.publicUrl);
          } else if (img.url) {
            urls.push(img.url);
          }
        } catch (err) {
          console.error("[create-character] variant failed", i, err);
        }
      }

      if (urls.length === 0) {
        await refundAICredits(user.id, costV, "character_portrait_variants");
        return j({ error: "Portrait variants could not be generated — credits refunded." }, 502);
      }
      const missing = variantCount - urls.length;
      if (missing > 0) await refundAICredits(user.id, missing * 3, "character_portrait_variants");
      return j({ imageUrls: urls, creditsUsed: urls.length * 3 });
    }

    // ── Regenerate portrait only (3 credits) ──────────────────────────────

    if (action === "regenerate_portrait") {
      if (!characterId || !name) return j({ error: "Character id and name are required" }, 400);
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: charRow } = await admin.from("characters")
        .select("description, category").eq("id", characterId).eq("user_id", user.id).maybeSingle();
      if (!charRow) return j({ error: "Character not found" }, 404);

      const cost2 = 3;
      const denied2 = await deductAICredits(user.id, cost2, "character_portrait_regen");
      if (denied2) return denied2;
      try {
        const visual = existingDescription || String(charRow.description ?? "").slice(0, 400);
        const img = await generateOpenAIImage(
          `Epic fantasy battle character portrait of "${name}", a ${charRow.category ?? category} warrior. ${visual}. Dramatic cinematic lighting, highly detailed digital painting, dynamic heroic pose, full upper body, vivid colors, game character art. No text, no watermark, no logos.`,
          "1024x1024",
        );
        let imageUrl: string | null = null;
        const b64 = img.b64_json;
        if (b64) {
          const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          const path = `characters/${user.id}/${Date.now()}.png`;
          const { error: upErr } = await admin.storage.from("ai-studio")
            .upload(path, bytes, { contentType: "image/png", upsert: true });
          if (upErr) throw upErr;
          imageUrl = admin.storage.from("ai-studio").getPublicUrl(path).data.publicUrl;
          await admin.from("characters").update({ image_url: imageUrl }).eq("id", characterId);
        } else if (img.url) {
          imageUrl = img.url;
          await admin.from("characters").update({ image_url: imageUrl }).eq("id", characterId);
        }
        return j({ imageUrl, creditsUsed: cost2 });
      } catch (err) {
        await refundAICredits(user.id, cost2, "character_portrait_regen");
        console.error("[create-character] portrait regen failed", err);
        return j({ error: "Portrait regeneration failed — credits refunded." }, 502);
      }
    }

    if (!name || !category) return j({ error: "Name and category are required" }, 400);

    // Unified AI credits: 5 for a basic warrior, 15 for a premium one.
    const cost = isPremium ? 15 : 5;
    const denied = await deductAICredits(user.id, cost, "character_creation");
    if (denied) return denied;

    try {
      const raw = await callUnifiedAI(
        [
          { role: "system", content: "You are a game designer creating battle characters. Reply with strict JSON only." },
          { role: "user", content: `Create a ${isPremium ? "legendary premium" : "solid"} ${category} warrior named "${name}". ${description ? `Concept: ${description}.` : ""}
Return JSON: {"backstory": "4-6 vivid sentences", "appearance": "one vivid sentence describing looks, armor, weapon, colors", "stats": {"hp": number 80-200, "attack": number 40-120, "defense": number 30-110, "speed": number 30-110}}` },
        ],
        { max_tokens: 1200, json: true },
      );


      const text = typeof raw === "string" ? raw : (raw?.content ?? raw?.text ?? "");
      let parsed: any = {};
      try {
        parsed = JSON.parse(String(text).replace(/```json|```/g, "").trim());
      } catch {
        const m = String(text).match(/\{[\s\S]*\}/);
        if (m) { try { parsed = JSON.parse(m[0]); } catch { /* ignore */ } }
      }

      const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));
      const bonus = isPremium ? 20 : 0;
      const stats = {
        hp: Number(parsed?.stats?.hp) || rand(90, 160) + bonus,
        attack: Number(parsed?.stats?.attack) || rand(45, 100) + bonus,
        defense: Number(parsed?.stats?.defense) || rand(35, 95) + bonus,
        speed: Number(parsed?.stats?.speed) || rand(35, 95) + bonus };

      // Portrait generation (best-effort — never blocks the warrior creation)
      let imageUrl: string | null = null;
      try {
        const visual = String(parsed?.appearance ?? description ?? "").slice(0, 400);
        const img = await generateOpenAIImage(
          `Epic fantasy battle character portrait of "${name}", a ${category} warrior. ${visual}. Dramatic cinematic lighting, highly detailed digital painting, dynamic heroic pose, full upper body, vivid colors, game character art. No text, no watermark, no logos.`,
          "1024x1024",
        );
        const b64 = img.b64_json;
        if (b64) {
          const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
          const path = `characters/${user.id}/${Date.now()}.png`;
          const { error: upErr } = await admin.storage.from("ai-studio")
            .upload(path, bytes, { contentType: "image/png", upsert: true });
          if (upErr) throw upErr;
          imageUrl = admin.storage.from("ai-studio").getPublicUrl(path).data.publicUrl;
        } else if (img.url) {
          imageUrl = img.url;
        }
      } catch (imgErr) {
        console.error("[create-character] portrait generation failed", imgErr);
      }

      return j({
        backstory: parsed?.backstory || `${name} is a ${category.toLowerCase()} warrior forged in the heat of countless battles.`,
        imageUrl,
        stats,
        creditsUsed: cost });

    } catch (aiErr) {
      await refundAICredits(user.id, cost, "character_creation");
      console.error("[create-character] AI failed", aiErr);
      return j({ error: "The AI could not forge this warrior. Your credits were refunded — please try again." }, 502);
    }
  } catch (e) {
    return j({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
