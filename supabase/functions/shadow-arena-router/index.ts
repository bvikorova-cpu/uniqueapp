import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

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
