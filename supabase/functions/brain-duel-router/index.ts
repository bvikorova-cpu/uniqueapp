import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS" };

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const CREDIT_COSTS: Record<string, number> = { "ai.generateQuiz": 5,
  "ai.ocrScan": 5,
  "ai.voiceQuiz": 3,
  "ai.cheatScan": 2,
  "ai.shareCard": 2,
  "deck.publish": 4,
  "tournament.enter": 10 };

const TIERS = [
  { min: 0, name: "iron" }, { min: 1100, name: "bronze" }, { min: 1250, name: "silver" },
  { min: 1400, name: "gold" }, { min: 1600, name: "platinum" }, { min: 1800, name: "diamond" },
  { min: 2100, name: "master" }, { min: 2400, name: "phoenix" },
];
const tierFor = (r: number) => [...TIERS].reverse().find(t => r >= t.min)!.name;

async function spendBrainDuelCredits(admin: any, userId: string, amount: number) {
  if (amount <= 0) return;
  const { data: ok, error } = await admin.rpc("deduct_ai_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: "brain_duel_router_action",
    p_source: "brain_duel"
  });
  if (error || ok === false) {
    const e: any = new Error("Insufficient credits");
    e.status = 402;
    throw e;
  }
}

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

async function callAI(prompt: string, system = "You are a precise quiz generator. Respond with valid JSON only.") {
  // Prefer Lovable AI Gateway; fall back to direct OpenAI if a key is configured.
  const useGateway = !!LOVABLE_API_KEY;
  if (!useGateway && !OPENAI_API_KEY) {
    const e: any = new Error("AI is not configured. Please contact support.");
    e.status = 503;
    throw e;
  }
  const url = useGateway
    ? "https://ai.gateway.lovable.dev/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (useGateway) headers["Lovable-API-Key"] = LOVABLE_API_KEY!;
  else headers["Authorization"] = `Bearer ${OPENAI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: useGateway ? "openai/gpt-5.4-mini" : "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const e: any = new Error(
      res.status === 429
        ? "AI rate limited. Try again in a moment."
        : res.status === 402
        ? "AI credits exhausted. Please top up."
        : `AI error ${res.status}: ${detail.slice(0, 200)}`
    );
    e.status = res.status;
    throw e;
  }
  const j = await res.json();
  return { text: j.choices?.[0]?.message?.content ?? "" };
}

function parseAIJson(text: string): any {
  try { return JSON.parse(text); } catch { /* noop */ }
  const m = text.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch { /* noop */ } }
  return { raw: text };
}


function eloUpdate(ra: number, rb: number, scoreA: number, k = 32) {
  const ea = 1 / (1 + Math.pow(10, (rb - ra) / 400));
  return Math.round(ra + k * (scoreA - ea));
}

function srsNext(stage: string, ease: number, interval: number, quality: number) {
  // quality: 0 again, 3 hard, 4 good, 5 easy
  let newStage = stage, newInterval = interval, newEase = ease;
  if (quality < 3) { newStage = "learning"; newInterval = 1; newEase = Math.max(1.3, ease - 0.2); }
  else if (stage === "new") { newStage = "learning"; newInterval = 1; }
  else if (stage === "learning") { newStage = quality >= 4 ? "mastered" : "learning"; newInterval = quality >= 4 ? 6 : 3; }
  else { newInterval = Math.round(interval * ease); newEase = Math.max(1.3, ease + (quality === 5 ? 0.1 : quality === 4 ? 0 : -0.15)); }
  const nextAt = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000).toISOString();
  return { stage: newStage, interval_days: newInterval, ease: newEase, next_review_at: nextAt };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
    const { data: userData } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json().catch(() => ({}));
    const action: string = body.action;
    if (!action) throw new Error("Missing action");

    // Rate limit: 120 router calls / min per user (covers AI-heavy paths).
    const { data: allowed } = await admin.rpc("check_rate_limit", { p_identifier: user.id,
      p_action_type: "brain_duel_router",
      p_max_requests: 120,
      p_window_seconds: 60 });
    if (allowed === false) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }


    const cost = CREDIT_COSTS[action] ?? 0;
    if (cost > 0) await spendBrainDuelCredits(admin, user.id, cost);

    let result: any = { ok: true };

    try {
    switch (action) {

      // ---------- Records CRUD ----------
      case "records.list": {
        const { kind, parent_id, mine, limit = 50 } = body;
        let q = admin.from("brain_duel_records").select("*").order("created_at", { ascending: false }).limit(limit);
        if (kind) q = q.eq("kind", kind);
        if (parent_id) q = q.eq("parent_id", parent_id);
        if (mine) q = q.eq("user_id", user.id);
        const { data, error } = await q;
        if (error) throw error;
        result = { records: data };
        break;
      }
      case "records.create": {
        const { kind, payload = {}, parent_id = null, is_public = true } = body;
        if (!kind) throw new Error("kind required");
        const { data, error } = await admin
          .from("brain_duel_records")
          .insert({ user_id: user.id, kind, payload, parent_id, is_public })
          .select().single();
        if (error) throw error;
        result = { record: data };
        break;
      }
      case "records.delete": {
        const { id } = body;
        const { error } = await admin.from("brain_duel_records").delete().eq("id", id).eq("user_id", user.id);
        if (error) throw error;
        break;
      }

      // ---------- 1. AI Question Generator ----------
      case "ai.generateQuiz": {
        const { topic, count = 10, difficulty = "medium" } = body;
        if (!topic || !String(topic).trim()) {
          const e: any = new Error("Please enter a topic."); e.status = 400; throw e;
        }
        const { text } = await callAI(
          `Generate ${count} ${difficulty} difficulty multiple-choice quiz questions on "${topic}". Return JSON {questions:[{q, options:[a,b,c,d], correct_index, explanation}]}.`
        );
        result = { quiz: parseAIJson(text) };
        break;
      }

      // ---------- 2. OCR Scan → Quiz ----------
      case "ai.ocrScan": {
        const { imageUrl, count = 8 } = body;
        const { text } = await callAI(
          `Read text from image at ${imageUrl} and create ${count} quiz questions. Return JSON {questions:[{q, options:[a,b,c,d], correct_index}]}.`
        );
        result = { quiz: parseAIJson(text) };
        break;
      }


      // ---------- 3. Voice Quiz Battle ----------
      case "ai.voiceQuiz": {
        const { topic, transcript } = body;
        const { text } = await callAI(
          `Quiz question on "${topic}". User spoken answer: "${transcript}". Return JSON {question, correct_answer, user_correct:boolean, feedback}.`
        );
        result = { round: text };
        break;
      }

      // ---------- 4. AI Cheat Detection ----------
      case "ai.cheatScan": {
        const { responseTimes = [], accuracy = 0, duelId } = body;
        const { text } = await callAI(
          `Analyze duel ${duelId} for cheating. Response times (ms): ${JSON.stringify(responseTimes)}. Accuracy: ${accuracy}. Return JSON {suspicious:boolean, score:0-100, reasons:[]}.`
        );
        result = { report: text };
        break;
      }

      // ---------- 5. Shareable Result Card ----------
      case "ai.shareCard": {
        const { winner, loser, score, topic } = body;
        const { text } = await callAI(
          `Create Instagram story copy for Brain Duel result. Winner: ${winner}, loser: ${loser}, score: ${score}, topic: ${topic}. Return JSON {headline, caption, hashtags:[]}.`
        );
        result = { card: text };
        break;
      }

      // ---------- 6. SRS (Spaced Repetition) ----------
      case "srs.addCard": {
        const { topic, question, answer } = body;
        const { data, error } = await admin.from("brain_duel_srs_cards")
          .insert({ user_id: user.id, topic, question, answer }).select().single();
        if (error) throw error;
        result = { card: data };
        break;
      }
      case "srs.due": {
        const { limit = 20 } = body;
        const { data, error } = await admin.from("brain_duel_srs_cards")
          .select("*").eq("user_id", user.id).lte("next_review_at", new Date().toISOString())
          .order("next_review_at").limit(limit);
        if (error) throw error;
        result = { cards: data };
        break;
      }
      case "srs.review": {
        const { id, quality } = body;
        const { data: card } = await admin.from("brain_duel_srs_cards")
          .select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
        if (!card) throw new Error("Card not found");
        const upd = srsNext(card.stage, Number(card.ease), card.interval_days, quality);
        const { data, error } = await admin.from("brain_duel_srs_cards")
          .update({ ...upd, last_review_at: new Date().toISOString(), review_count: card.review_count + 1 })
          .eq("id", id).select().single();
        if (error) throw error;
        result = { card: data };
        break;
      }

      // ---------- 7. ELO Matchmaking ----------
      case "elo.getMine": {
        const { data } = await admin.from("brain_duel_elo").select("*").eq("user_id", user.id).maybeSingle();
        if (!data) {
          const { data: created } = await admin.from("brain_duel_elo")
            .insert({ user_id: user.id }).select().single();
          result = { elo: created };
        } else result = { elo: data };
        break;
      }
      case "elo.leaderboard": {
        const { limit = 50 } = body;
        const { data } = await admin.from("brain_duel_elo").select("*").order("rating", { ascending: false }).limit(limit);
        result = { leaderboard: data };
        break;
      }
      case "elo.report": {
        // SECURITY: client used to pass `won` + `opponentId` directly, allowing arbitrary rating manipulation.
        // Now requires a real finished match; server derives winner and ensures one-time reporting.
        const { matchId } = body;
        if (!matchId) {
          return new Response(JSON.stringify({ error: "matchId required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const { data: match } = await admin
          .from("brain_duel_matches")
          .select("id,player1_id,player2_id,winner_id,finished_at,elo_reported")
          .eq("id", matchId)
          .maybeSingle();
        if (!match) {
          return new Response(JSON.stringify({ error: "match_not_found" }), {
            status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (match.player1_id !== user.id && match.player2_id !== user.id) {
          return new Response(JSON.stringify({ error: "not_a_participant" }), {
            status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (!match.finished_at || !match.winner_id) {
          return new Response(JSON.stringify({ error: "match_not_finished" }), {
            status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (match.elo_reported) {
          // Idempotent: already applied, just return current rating.
          const { data: mine } = await admin.from("brain_duel_elo").select("*").eq("user_id", user.id).maybeSingle();
          result = { newRating: mine?.rating, newTier: mine ? tierFor(mine.rating) : null, alreadyReported: true };
          break;
        }
        const opponentId = match.player1_id === user.id ? match.player2_id : match.player1_id;
        const won = match.winner_id === user.id;

        const ensure = async (uid: string) => {
          const { data } = await admin.from("brain_duel_elo").select("*").eq("user_id", uid).maybeSingle();
          if (data) return data;
          const { data: c } = await admin.from("brain_duel_elo").insert({ user_id: uid }).select().single();
          return c;
        };
        const me = await ensure(user.id);
        const opp = await ensure(opponentId);
        const newMe = eloUpdate(me.rating, opp.rating, won ? 1 : 0);
        const newOpp = eloUpdate(opp.rating, me.rating, won ? 0 : 1);
        await admin.from("brain_duel_elo").update({ rating: newMe, tier: tierFor(newMe),
          wins: me.wins + (won ? 1 : 0), losses: me.losses + (won ? 0 : 1),
          peak_rating: Math.max(me.peak_rating, newMe) }).eq("user_id", user.id);
        await admin.from("brain_duel_elo").update({ rating: newOpp, tier: tierFor(newOpp),
          wins: opp.wins + (won ? 0 : 1), losses: opp.losses + (won ? 1 : 0),
          peak_rating: Math.max(opp.peak_rating, newOpp) }).eq("user_id", opponentId);

        // Mark idempotent flag; if race, second caller will hit alreadyReported branch.
        await admin.from("brain_duel_matches").update({ elo_reported: true }).eq("id", matchId).eq("elo_reported", false);

        result = { newRating: newMe, newTier: tierFor(newMe), won };
        break;
      }

      // ---------- 8. Topic Communities ----------
      case "topics.list": {
        const { data } = await admin.from("brain_duel_topics").select("*").order("member_count", { ascending: false }).limit(100);
        result = { topics: data };
        break;
      }
      case "topics.create": {
        const { slug, name, description } = body;
        const { data, error } = await admin.from("brain_duel_topics")
          .insert({ slug, name, description, created_by: user.id, member_count: 1 }).select().single();
        if (error) throw error;
        result = { topic: data };
        break;
      }

      // ---------- 9. Custom Decks (publish costs credits) ----------
      case "deck.publish": {
        const { title, topic, questions } = body;
        const { data, error } = await admin.from("brain_duel_records")
          .insert({ user_id: user.id, kind: "custom_deck", payload: { title, topic, questions }, is_public: true })
          .select().single();
        if (error) throw error;
        result = { deck: data };
        break;
      }

      // ---------- 10. Tournaments ----------
      case "tournament.enter": {
        const { tournamentId } = body;
        const { data, error } = await admin.from("brain_duel_records")
          .insert({
            user_id: user.id, kind: "tournament_entry",
            parent_id: tournamentId, payload: { entered_at: new Date().toISOString(), entry_fee: 10 },
            is_public: false }).select().single();
        if (error) throw error;
        result = { entry: data };
        break;
      }

      // ---------- 11. Async turn-based ----------
      case "async.move": {
        const { matchId, move } = body;
        const { data, error } = await admin.from("brain_duel_records")
          .insert({
            user_id: user.id, kind: "async_move", parent_id: matchId,
            payload: { move, at: new Date().toISOString() }, is_public: true }).select().single();
        if (error) throw error;
        result = { move: data };
        break;
      }

      // ---------- 12. Credits balance ----------
      case "credits.balance": {
        const { data } = await admin.from("ai_credits").select("user_id, credits_remaining, credits_used, last_reset_at, updated_at").eq("user_id", user.id).maybeSingle();
        result = { credits: data };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    const status = err?.status ?? 500;
    return new Response(JSON.stringify({ error: err?.message ?? "Server error" }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
