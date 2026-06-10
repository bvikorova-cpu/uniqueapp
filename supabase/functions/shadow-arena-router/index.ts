import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "no_auth" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);
    const supabase = createClient(url, svc);
    const body = await req.json().catch(() => ({}));
    const { action, ...p } = body || {};

    switch (action) {
      // ---- Duet battles ----
      case "duet_create": {
        const { theme, opponent_id } = p;
        if (!theme) return json({ error: "missing_theme" }, 400);
        const { data, error } = await supabase.from("shadow_duet_battles").insert({
          creator_a: user.id, creator_b: opponent_id || null, theme,
        }).select().single();
        if (error) throw error;
        return json({ duet: data });
      }
      case "duet_vote": {
        const { duet_id, vote_for } = p;
        if (!duet_id || !["A","B"].includes(vote_for)) return json({ error: "bad_input" }, 400);
        const { error } = await supabase.from("shadow_duet_votes").insert({
          duet_id, voter_id: user.id, vote_for,
        });
        if (error && !String(error.message).includes("duplicate")) throw error;
        const col = vote_for === "A" ? "votes_a" : "votes_b";
        await supabase.rpc("noop", {}).catch(() => {});
        const { data: cur } = await supabase.from("shadow_duet_battles").select(col).eq("id", duet_id).single();
        await supabase.from("shadow_duet_battles").update({ [col]: ((cur as any)?.[col] || 0) + 1 }).eq("id", duet_id);
        return json({ ok: true });
      }

      // ---- Virtual Gifts ----
      case "gift_send": {
        const { gift_code, recipient_id, context_type, context_id } = p;
        if (!gift_code || !recipient_id) return json({ error: "bad_input" }, 400);
        const { data: gift } = await supabase.from("shadow_gift_catalog")
          .select("*").eq("code", gift_code).eq("is_active", true).single();
        if (!gift) return json({ error: "gift_not_found" }, 404);
        // charge credits
        const { data: credits } = await supabase.from("shadow_arena_credits")
          .select("*").eq("user_id", user.id).single();
        const balance = credits?.credits_remaining ?? 0;
        if (balance < gift.credit_cost) return json({ error: "insufficient_credits", required: gift.credit_cost, balance }, 402);
        const field = "credits_remaining";
        await supabase.from("shadow_arena_credits").update({ [field]: balance - gift.credit_cost }).eq("user_id", user.id);
        await supabase.from("shadow_gift_sends").insert({
          sender_id: user.id, recipient_id, gift_code,
          credits_spent: gift.credit_cost, context_type, context_id,
        });
        // bump active goal if recipient is the creator
        const { data: goal } = await supabase.from("shadow_stream_goals")
          .select("*").eq("creator_id", recipient_id).eq("is_active", true)
          .order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (goal) {
          const newTotal = goal.current_credits + gift.credit_cost;
          const completed = newTotal >= goal.target_credits;
          await supabase.from("shadow_stream_goals").update({
            current_credits: newTotal,
            is_active: !completed,
            completed_at: completed ? new Date().toISOString() : null,
          }).eq("id", goal.id);
        }
        return json({ ok: true, gift, charged: gift.credit_cost });
      }

      // ---- Stream Goals ----
      case "goal_create": {
        const { title, target_credits, reward_description } = p;
        if (!title || !target_credits) return json({ error: "bad_input" }, 400);
        const { data, error } = await supabase.from("shadow_stream_goals").insert({
          creator_id: user.id, title, target_credits, reward_description,
        }).select().single();
        if (error) throw error;
        return json({ goal: data });
      }

      // ---- Tournaments ----
      case "tournament_join": {
        const { tournament_id } = p;
        if (!tournament_id) return json({ error: "bad_input" }, 400);
        const { data: t } = await supabase.from("shadow_tournaments").select("*").eq("id", tournament_id).single();
        if (!t || t.status !== "open") return json({ error: "closed" }, 400);
        const { count } = await supabase.from("shadow_tournament_entries")
          .select("*", { count: "exact", head: true }).eq("tournament_id", tournament_id);
        if ((count || 0) >= t.max_participants) return json({ error: "full" }, 400);
        if (t.entry_credits > 0) {
          const { data: cr } = await supabase.from("shadow_arena_credits").select("*").eq("user_id", user.id).single();
          const bal = cr?.credits_remaining ?? 0;
          if (bal < t.entry_credits) return json({ error: "insufficient_credits" }, 402);
          const field = "credits_remaining";
          await supabase.from("shadow_arena_credits").update({ [field]: bal - t.entry_credits }).eq("user_id", user.id);
          await supabase.from("shadow_tournaments").update({ prize_pool_credits: t.prize_pool_credits + t.entry_credits }).eq("id", tournament_id);
        }
        const { error } = await supabase.from("shadow_tournament_entries").insert({
          tournament_id, user_id: user.id,
        });
        if (error && !String(error.message).includes("duplicate")) throw error;
        return json({ ok: true });
      }

      // ---- Schedule ----
      case "schedule_create": {
        const { title, description, scheduled_for, cover_emoji } = p;
        if (!title || !scheduled_for) return json({ error: "bad_input" }, 400);
        const { data, error } = await supabase.from("shadow_stream_schedule").insert({
          creator_id: user.id, title, description, scheduled_for, cover_emoji: cover_emoji || "🌑",
        }).select().single();
        if (error) throw error;
        return json({ schedule: data });
      }
      case "reminder_toggle": {
        const { schedule_id } = p;
        if (!schedule_id) return json({ error: "bad_input" }, 400);
        const { data: existing } = await supabase.from("shadow_stream_reminders")
          .select("id").eq("schedule_id", schedule_id).eq("user_id", user.id).maybeSingle();
        if (existing) {
          await supabase.from("shadow_stream_reminders").delete().eq("id", existing.id);
          return json({ subscribed: false });
        } else {
          await supabase.from("shadow_stream_reminders").insert({ schedule_id, user_id: user.id });
          return json({ subscribed: true });
        }
      }

      // ---- Auto Clips ----
      case "clip_create": {
        const { source_type, source_id, title, highlight_text, emoji, duration_seconds } = p;
        if (!title || !highlight_text) return json({ error: "bad_input" }, 400);
        const { data, error } = await supabase.from("shadow_auto_clips").insert({
          creator_id: user.id, source_type: source_type || "story", source_id,
          title, highlight_text, emoji: emoji || "🎬", duration_seconds: duration_seconds || 20,
        }).select().single();
        if (error) throw error;
        return json({ clip: data });
      }
      case "clip_share": {
        const { clip_id } = p;
        if (!clip_id) return json({ error: "bad_input" }, 400);
        const { data: cur } = await supabase.from("shadow_auto_clips").select("shares").eq("id", clip_id).single();
        await supabase.from("shadow_auto_clips").update({ shares: (cur?.shares || 0) + 1 }).eq("id", clip_id);
        return json({ ok: true });
      }

      // ---- Moderation ----
      case "mod_add": {
        const { mod_user_id } = p;
        if (!mod_user_id) return json({ error: "bad_input" }, 400);
        const { error } = await supabase.from("shadow_stream_mods").insert({
          creator_id: user.id, mod_user_id,
        });
        if (error && !String(error.message).includes("duplicate")) throw error;
        return json({ ok: true });
      }
      case "banned_word_add": {
        const { word } = p;
        if (!word) return json({ error: "bad_input" }, 400);
        const { error } = await supabase.from("shadow_banned_words").insert({
          creator_id: user.id, word: word.toLowerCase().trim(),
        });
        if (error && !String(error.message).includes("duplicate")) throw error;
        return json({ ok: true });
      }
      case "banned_word_remove": {
        const { word } = p;
        await supabase.from("shadow_banned_words").delete()
          .eq("creator_id", user.id).eq("word", word.toLowerCase().trim());
        return json({ ok: true });
      }

      // ---- Curse Wheel (one free spin/day) ----
      case "curse_wheel_spin": {
        const PRIZES = [
          { type: "credits", value: 5, label: "+5 Cursed Credits", weight: 30 },
          { type: "credits", value: 10, label: "+10 Cursed Credits", weight: 20 },
          { type: "credits", value: 20, label: "+20 Cursed Credits", weight: 10 },
          { type: "credits", value: 50, label: "+50 Cursed Credits — JACKPOT!", weight: 2 },
          { type: "multiplier", value: 2, label: "2x Vote Multiplier (24h)", weight: 15 },
          { type: "badge", value: 1, label: "Lucky Spirit Badge", weight: 8 },
          { type: "nothing", value: 0, label: "The shadows took your luck...", weight: 15 },
        ];
        const total = PRIZES.reduce((s, pp) => s + pp.weight, 0);
        let r = Math.random() * total;
        let prize = PRIZES[0];
        for (const pp of PRIZES) { if ((r -= pp.weight) <= 0) { prize = pp; break; } }
        const today = new Date(); today.setUTCHours(0, 0, 0, 0);
        const { data: existing } = await supabase
          .from("shadow_curse_wheel_spins").select("id")
          .eq("user_id", user.id).gte("spun_at", today.toISOString()).limit(1);
        if (existing && existing.length > 0) {
          return json({ error: "Already spun today. Come back tomorrow." }, 400);
        }
        await supabase.from("shadow_curse_wheel_spins").insert({
          user_id: user.id, prize_type: prize.type, prize_value: prize.value, prize_label: prize.label,
        });
        if (prize.type === "credits" && prize.value > 0) {
          const { data: cur } = await supabase.from("shadow_arena_credits")
            .select("credits_remaining").eq("user_id", user.id).maybeSingle();
          const newBalance = (cur?.credits_remaining || 0) + prize.value;
          await supabase.from("shadow_arena_credits").upsert({ user_id: user.id, credits_remaining: newBalance });
        }
        if (prize.type === "badge") {
          await supabase.from("shadow_cursed_achievements").insert({
            user_id: user.id, achievement_code: "lucky_spirit",
            achievement_name: "Lucky Spirit", rarity: "rare",
          }).then(() => {}, () => {});
        }
        return json({ prize });
      }

      // ---- Horror Reel (15 credits, gpt-4o-mini script gen) ----
      case "horror_reel": {
        const REEL_COST = 15;
        const { prompt, storyId, title } = p;
        if (!prompt) return json({ error: "Missing prompt" }, 400);
        const { data: cur } = await supabase.from("shadow_arena_credits")
          .select("credits_remaining").eq("user_id", user.id).maybeSingle();
        if (!cur || cur.credits_remaining < REEL_COST) {
          return json({ error: `Need ${REEL_COST} credits.` }, 402);
        }
        const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
        if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);
        const scriptRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You write 30-second horror reel scripts: 5 short cinematic scenes with timestamps, visual descriptions, and a chilling voiceover line each. Output JSON: {scenes:[{time, visual, voiceover}], hook}." },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          }),
        });
        const scriptJson = await scriptRes.json();
        const reelScript = JSON.parse(scriptJson.choices[0].message.content);
        const { data: reel, error: rErr } = await supabase.from("shadow_horror_reels").insert({
          user_id: user.id, story_id: storyId || null, title: title || "Untitled Horror Reel",
          prompt, status: "ready", thumbnail_url: null, video_url: null,
          duration_seconds: 30, credits_used: REEL_COST,
        }).select().single();
        if (rErr) throw rErr;
        await supabase.from("shadow_arena_credits").update({
          credits_remaining: cur.credits_remaining - REEL_COST,
        }).eq("user_id", user.id);
        return json({ reel, script: reelScript });
      }

      // ---- AI Narrator (ElevenLabs TTS, 6 credits) ----
      case "ai_narrate": {
        const NARRATOR_COST = 6;
        const MAX_CHARS = 2000;
        const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
        if (!apiKey) return json({ error: "ELEVENLABS_API_KEY not configured" }, 500);
        const { text, voiceId = "kPtEHAvRnjUJFv7SK9WI", voiceLabel = "Glitch", storyId = null } = p;
        if (!text || typeof text !== "string") return json({ error: "Missing text" }, 400);
        if (text.length > MAX_CHARS) return json({ error: `Text too long (max ${MAX_CHARS} chars)` }, 400);
        const { data: credits } = await supabase.from("shadow_arena_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
        if (!credits || credits.credits_remaining < NARRATOR_COST) {
          return json({ error: "Insufficient credits", required: NARRATOR_COST }, 402);
        }
        const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
          method: "POST",
          headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.6, similarity_boost: 0.8, style: 0.6, use_speaker_boost: true, speed: 0.92 },
          }),
        });
        if (!ttsResponse.ok) {
          const errText = await ttsResponse.text();
          console.error("ElevenLabs error:", ttsResponse.status, errText);
          if (ttsResponse.status === 429) return json({ error: "ElevenLabs rate limited" }, 429);
          throw new Error("ElevenLabs TTS error");
        }
        const audioBuffer = await ttsResponse.arrayBuffer();
        const audioBase64 = base64Encode(new Uint8Array(audioBuffer));
        const { data: saved } = await supabase.from("shadow_narrations").insert({
          user_id: user.id, story_id: storyId, story_text: text, audio_base64: audioBase64,
          voice_id: voiceId, voice_label: voiceLabel, credits_used: NARRATOR_COST,
        }).select("id").single();
        await supabase.from("shadow_arena_credits").update({
          credits_remaining: credits.credits_remaining - NARRATOR_COST,
          last_used_at: new Date().toISOString(),
        }).eq("user_id", user.id);
        return json({ audioBase64, narrationId: saved?.id, creditsRemaining: credits.credits_remaining - NARRATOR_COST });
      }

      // ---- AI Story Generator (OpenAI gpt-4o + optional image, 4 credits) ----
      case "ai_story_generate": {
        const STORY_COST = 4;
        const openaiKey = Deno.env.get("OPENAI_API_KEY");
        if (!openaiKey) return json({ error: "OPENAI_API_KEY not configured" }, 500);
        const { prompt, tone = "gothic", length = "medium", generateImage = true } = p;
        if (!prompt) return json({ error: "Missing prompt" }, 400);
        const { data: credits } = await supabase.from("shadow_arena_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
        if (!credits || credits.credits_remaining < STORY_COST) {
          return json({ error: "Insufficient credits", required: STORY_COST }, 402);
        }
        const lengthMap: Record<string, string> = {
          short: "exactly 150-200 words",
          medium: "exactly 350-450 words",
          long: "exactly 700-900 words",
        };
        const toneMap: Record<string, string> = {
          gothic: "Victorian gothic horror with elegant prose, candlelight, decaying mansions",
          psychological: "psychological horror with unreliable narrator and creeping dread",
          cosmic: "cosmic Lovecraftian horror with incomprehensible entities",
          slasher: "fast-paced visceral slasher with chase scenes",
          supernatural: "haunting supernatural ghost story",
          folk: "folk horror with rural rituals and ancient evil",
        };
        const systemPrompt = `You are a master horror author writing in the style of ${toneMap[tone] || toneMap.gothic}.
Generate a complete, polished horror story (${lengthMap[length] || lengthMap.medium}).
Return JSON with: { "title": "evocative title", "story": "full story text" }.
The story must have a strong opening hook, atmospheric build-up, and chilling ending.`;
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          }),
        });
        if (!aiResponse.ok) {
          if (aiResponse.status === 429) return json({ error: "OpenAI rate limited" }, 429);
          const t = await aiResponse.text();
          console.error("OpenAI error:", aiResponse.status, t);
          throw new Error("OpenAI API error");
        }
        const data = await aiResponse.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        const generatedTitle = parsed.title;
        const generatedStory = parsed.story;
        let illustrationUrl: string | null = null;
        if (generateImage) {
          try {
            const imgPrompt = `Cinematic gothic horror illustration for: "${generatedTitle}". ${prompt.slice(0, 200)}. Dark moody atmospheric, deep shadows, crimson accents, painterly oil texture, no text, no watermark.`;
            const imgResp = await fetch("https://api.openai.com/v1/images/generations", {
              method: "POST",
              headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({ model: "gpt-image-1", prompt: imgPrompt, n: 1, size: "1024x1024" }),
            });
            if (imgResp.ok) {
              const imgData = await imgResp.json();
              illustrationUrl = imgData.data?.[0]?.b64_json
                ? `data:image/png;base64,${imgData.data[0].b64_json}`
                : null;
            } else {
              console.warn("Image gen failed", imgResp.status);
            }
          } catch (e) {
            console.warn("Image gen exception", e);
          }
        }
        const { data: saved } = await supabase.from("shadow_ai_stories").insert({
          user_id: user.id, prompt, generated_title: generatedTitle, generated_story: generatedStory,
          illustration_url: illustrationUrl, tone, length, credits_used: STORY_COST,
        }).select().single();
        await supabase.from("shadow_arena_credits").update({
          credits_remaining: credits.credits_remaining - STORY_COST,
          last_used_at: new Date().toISOString(),
        }).eq("user_id", user.id);
        return json({ story: saved, creditsRemaining: credits.credits_remaining - STORY_COST });
      }

      // ---- Battle Predictor (OpenAI gpt-4o-mini, 5 credits) ----
      case "battle_predict": {
        const PREDICT_COST = 5;
        const openaiKey = Deno.env.get("OPENAI_API_KEY");
        if (!openaiKey) return json({ error: "OPENAI_API_KEY not configured" }, 500);
        const { battleId } = p;
        if (!battleId) return json({ error: "Missing battleId" }, 400);
        const { data: credits } = await supabase.from("shadow_arena_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
        if (!credits || credits.credits_remaining < PREDICT_COST) {
          return json({ error: "Insufficient credits", required: PREDICT_COST }, 402);
        }
        let battleInfo: any = null;
        let participants: any[] = [];
        try {
          const { data: b } = await supabase.from("shadow_battles").select("*").eq("id", battleId).maybeSingle();
          battleInfo = b;
        } catch (_) { /* ignore */ }
        try {
          const { data: parts } = await supabase.from("shadow_battle_participants").select("*").eq("battle_id", battleId).limit(20);
          participants = parts || [];
        } catch (_) { /* ignore */ }
        let totalVotes = 0;
        try {
          const { count } = await supabase.from("shadow_battle_votes").select("*", { count: "exact", head: true }).eq("battle_id", battleId);
          totalVotes = count || 0;
        } catch (_) { /* ignore */ }
        const context = {
          theme: battleInfo?.challenge_theme || "Unknown horror theme",
          status: battleInfo?.status || "unknown",
          prizePool: battleInfo?.total_prize_pool || 0,
          participantCount: participants.length,
          participantNames: participants.map((pp: any) => pp.username || pp.user_id?.slice(0, 8) || "Anonymous").slice(0, 10),
          totalVoteSignals: totalVotes,
        };
        const systemPrompt = `You are an AI horror battle analyst. Analyze the battle context and predict the most likely winner.
Use storytelling craft, audience engagement signals, theme fit, and momentum.
Return JSON: {
  "predicted_winner_name": "name or 'Unknown contender'",
  "confidence_score": 0-100,
  "reasoning": "2-3 sentence analysis with dramatic flair",
  "factors": { "theme_fit": 0-100, "momentum": 0-100, "audience_pull": 0-100, "narrative_skill": 0-100 }
}`;
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Battle context: ${JSON.stringify(context)}` },
            ],
            response_format: { type: "json_object" },
          }),
        });
        if (!aiResponse.ok) {
          if (aiResponse.status === 429) return json({ error: "OpenAI rate limited" }, 429);
          throw new Error("OpenAI API error");
        }
        const data = await aiResponse.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        const { data: saved } = await supabase.from("shadow_battle_predictions").insert({
          user_id: user.id, battle_id: battleId,
          predicted_winner_name: parsed.predicted_winner_name,
          confidence_score: parsed.confidence_score,
          reasoning: parsed.reasoning, factors: parsed.factors,
          credits_used: PREDICT_COST,
        }).select().single();
        await supabase.from("shadow_arena_credits").update({
          credits_remaining: credits.credits_remaining - PREDICT_COST,
          last_used_at: new Date().toISOString(),
        }).eq("user_id", user.id);
        return json({ prediction: saved, creditsRemaining: credits.credits_remaining - PREDICT_COST });
      }

      // ---- Nightmare Avatar (OpenAI gpt-image-1 edit, 8 credits) ----
      case "nightmare_avatar": {
        const AVATAR_COST = 8;
        const STYLE_PROMPTS: Record<string, string> = {
          vampire: "Transform this person into an elegant Victorian vampire: pale skin, deep red eyes, fangs subtly visible, gothic clothing, candlelit background, painterly portrait, no text",
          ghost: "Transform this person into an ethereal ghost: translucent skin, hollow glowing eyes, wisps of fog around shoulders, faded edges, moonlight, no text",
          zombie: "Transform this person into a movie-quality zombie: decaying skin with cracks, milky eyes, dirt and blood smudges, atmospheric lighting, cinematic horror, no text",
          demon: "Transform this person into a horned demon: red-burnished skin, glowing amber eyes, ornate horns, dark fantasy portrait, dramatic shadow lighting, no text",
          witch: "Transform this person into a gothic witch: dark hood, glowing rune marks on cheek, mysterious smoke, candlelit eerie portrait, painterly, no text",
          cursed_doll: "Transform this person into a cursed porcelain doll: cracked porcelain skin, button-style eyes, Victorian dress collar, eerie smile, dim attic lighting, no text",
          shadow_being: "Transform this person into a shadow being: face fades into living darkness, glowing red eyes, smoke for hair, void background, no text",
          werewolf: "Transform this person mid-transformation into a werewolf: partial fur on face, glowing yellow eyes, sharp teeth visible, full moon backlight, cinematic, no text",
        };
        const openaiKey = Deno.env.get("OPENAI_API_KEY");
        if (!openaiKey) return json({ error: "OPENAI_API_KEY not configured" }, 500);
        const { sourceImageUrl, style = "vampire" } = p;
        if (!sourceImageUrl) return json({ error: "Missing sourceImageUrl" }, 400);
        const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.vampire;
        const { data: credits } = await supabase.from("shadow_arena_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
        if (!credits || credits.credits_remaining < AVATAR_COST) {
          return json({ error: "Insufficient credits", required: AVATAR_COST }, 402);
        }
        const aiResponse = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-image-1",
            prompt: `${stylePrompt}\n\nReference image: ${sourceImageUrl}`,
            n: 1,
            size: "1024x1024",
          }),
        });
        if (!aiResponse.ok) {
          const t = await aiResponse.text();
          console.error("OpenAI error:", aiResponse.status, t);
          if (aiResponse.status === 429) return json({ error: "AI rate limited" }, 429);
          if (aiResponse.status === 402) return json({ error: "AI credits depleted in workspace" }, 402);
          throw new Error("AI image error");
        }
        const data = await aiResponse.json();
        const nightmareImageDataUrl = data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : null;
        if (!nightmareImageDataUrl) throw new Error("No image returned");
        const base64Data = nightmareImageDataUrl.split(",")[1];
        const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        const fileName = `${user.id}/nightmare-${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from("shadow-nightmare-avatars")
          .upload(fileName, binaryData, { contentType: "image/png", upsert: false });
        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error("Failed to store nightmare avatar");
        }
        const { data: pub } = supabase.storage.from("shadow-nightmare-avatars").getPublicUrl(fileName);
        const { data: saved } = await supabase.from("shadow_nightmare_avatars").insert({
          user_id: user.id, source_image_url: sourceImageUrl,
          nightmare_image_url: pub.publicUrl, style, credits_used: AVATAR_COST,
        }).select().single();
        await supabase.from("shadow_arena_credits").update({
          credits_remaining: credits.credits_remaining - AVATAR_COST,
          last_used_at: new Date().toISOString(),
        }).eq("user_id", user.id);
        return json({
          avatar: saved, nightmareImageUrl: pub.publicUrl,
          creditsRemaining: credits.credits_remaining - AVATAR_COST,
        });
      }

      // ---- Batch 14: shadow-arena-credits-init ----
      case "credits_init": {
        const { data: existing } = await supabase
          .from("shadow_arena_credits")
          .select("*").eq("user_id", user.id).maybeSingle();
        if (!existing) {
          const { data: created } = await supabase
            .from("shadow_arena_credits")
            .insert({ user_id: user.id, credits_remaining: 5, total_credits_purchased: 5 })
            .select().single();
          return json({ credits: created });
        }
        return json({ credits: existing });
      }

      // ---- Batch 14: shadow-voice-clone ----
      case "voice_clone": {
        const CLONE_COST = 25;
        const { audioBase64, voiceName } = p;
        if (!audioBase64 || !voiceName) return json({ error: "missing_audio_or_name" }, 400);

        const { data: cur } = await supabase.from("shadow_arena_credits")
          .select("credits_remaining").eq("user_id", user.id).maybeSingle();
        if (!cur || cur.credits_remaining < CLONE_COST) {
          return json({ error: `Need ${CLONE_COST} credits.` }, 402);
        }
        const ELEVEN = Deno.env.get("ELEVENLABS_API_KEY");
        if (!ELEVEN) return json({ error: "ELEVENLABS_API_KEY not configured" }, 500);

        const audioBytes = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
        const formData = new FormData();
        formData.append("name", voiceName);
        formData.append("files", new Blob([audioBytes], { type: "audio/mpeg" }), "sample.mp3");
        formData.append("description", `Shadow Arena cloned voice for user ${user.id}`);
        const cloneRes = await fetch("https://api.elevenlabs.io/v1/voices/add", {
          method: "POST", headers: { "xi-api-key": ELEVEN }, body: formData,
        });
        if (!cloneRes.ok) {
          const errTxt = await cloneRes.text();
          return json({ error: `ElevenLabs error: ${errTxt.slice(0, 300)}` }, 502);
        }
        const cloneJson = await cloneRes.json();

        const { error: dedErr } = await supabase.rpc(
          "deduct_shadow_arena_credits",
          { _user_id: user.id, _amount: CLONE_COST },
        );
        if (dedErr) {
          if (dedErr.message?.includes("INSUFFICIENT_CREDITS")) {
            return json({ error: `Need ${CLONE_COST} credits.` }, 402);
          }
          throw dedErr;
        }
        const { error: upsertErr } = await supabase.from("shadow_voice_clones").upsert({
          user_id: user.id, voice_id: cloneJson.voice_id, voice_name: voiceName,
          status: "active", credits_spent: CLONE_COST,
        });
        if (upsertErr) {
          await supabase.rpc("refund_shadow_arena_credits", { _user_id: user.id, _amount: CLONE_COST });
          throw upsertErr;
        }
        return json({ voice_id: cloneJson.voice_id, voice_name: voiceName });
      }

      default:
        return json({ error: "unknown_action" }, 400);

    }
  } catch (e) {
    console.error("shadow-arena-router:", e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
