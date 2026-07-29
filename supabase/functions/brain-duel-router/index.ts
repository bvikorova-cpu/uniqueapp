import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { callOpenAIJSON } from "../_shared/openai.ts";

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

async function callAI(
  prompt: string,
  system = "You are a precise quiz generator. Respond with valid JSON only.",
  imageUrl?: string,
) {
  // Text-only: use the unified provider (OpenAI primary, Lovable fallback).
  if (!imageUrl) {
    try {
      const result = await callOpenAIJSON({ system, user: prompt, model: "gpt-4o-mini" });
      return { text: JSON.stringify(result) };
    } catch (e: any) {
      const err: any = new Error(e?.message || "AI request failed");
      err.status = e?.status || 502;
      throw err;
    }
  }

  // Vision (OCR): OpenAI primary, Lovable fallback for rate-limit/quota/server errors.
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey && !lovableKey) {
    const e: any = new Error("AI is not configured. Please contact support.");
    e.status = 503;
    throw e;
  }

  const userContent = [{ type: "text" as const, text: prompt }, { type: "image_url" as const, image_url: { url: imageUrl } }];
  const order = openaiKey ? [false, true] : [true];
  let lastErr: any;

  for (const useGateway of order) {
    try {
      const res = await fetch(
        useGateway ? "https://ai.gateway.lovable.dev/v1/chat/completions" : "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: useGateway
            ? { "Lovable-API-Key": lovableKey!, "Content-Type": "application/json" }
            : { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: useGateway ? "google/gemini-3.6-flash" : "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [{ role: "system", content: system }, { role: "user", content: userContent }],
          }),
        },
      );
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        if (res.status === 429 || res.status === 402 || res.status >= 500) {
          lastErr = { status: res.status, message: `AI ${res.status}: ${detail.slice(0, 200)}` };
          continue;
        }
        const e: any = new Error(`AI error ${res.status}: ${detail.slice(0, 200)}`);
        e.status = res.status;
        throw e;
      }
      const j = await res.json();
      return { text: j.choices?.[0]?.message?.content ?? "" };
    } catch (e: any) {
      if (e.status === 429 || e.status === 402 || e.status >= 500) {
        lastErr = e;
        continue;
      }
      throw e;
    }
  }

  const err: any = new Error(lastErr?.message || "AI request failed. Please try again.");
  err.status = lastErr?.status || 502;
  throw err;
}

function parseAIJson(text: string): any {
  try { return JSON.parse(text); } catch { /* noop */ }
  const m = text.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch { /* noop */ } }
  return { raw: text };
}

async function enrichDuelsWithProfiles(admin: any, duels: any[]) {
  const ids = Array.from(new Set(
    duels
      .flatMap((d: any) => [d.player1_id, d.player2_id, d.winner_id])
      .filter((id: unknown) => typeof id === "string" && id.length > 0),
  ));
  if (!ids.length) return duels;

  const { data: profiles } = await admin
    .from("profiles")
    .select("id,full_name,username")
    .in("id", ids);
  const byId = new Map(
    (profiles ?? []).map((p: any) => [
      p.id,
      String(p.full_name || p.username || "Player").trim() || "Player",
    ]),
  );

  return duels.map((d: any) => {
    const player1Name = byId.get(d.player1_id) ?? "Player 1";
    const player2Name = d.player2_id ? (byId.get(d.player2_id) ?? "Player 2") : "Opponent";
    const player1Score = Number(d.player1_score ?? 0);
    const player2Score = Number(d.player2_score ?? 0);
    const winnerIsPlayer1 = d.winner_id
      ? d.winner_id === d.player1_id
      : player1Score >= player2Score;
    const winnerName = winnerIsPlayer1 ? player1Name : player2Name;
    const loserName = winnerIsPlayer1 ? player2Name : player1Name;
    return {
      ...d,
      player1_name: player1Name,
      player2_name: player2Name,
      winner_name: winnerName,
      loser_name: loserName,
      score_label: `${player1Score}-${player2Score}`,
      result_label: `${winnerName} beat ${loserName} ${player1Score}-${player2Score}`,
    };
  });
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
        if (!imageUrl || !/^(https?:\/\/|data:image\/)/.test(String(imageUrl))) {
          const e: any = new Error("Please upload a photo or paste a valid image URL.");
          e.status = 400; throw e;
        }
        const { text } = await callAI(
          `Read all text visible in this image and create ${count} multiple-choice quiz questions from it. Return JSON {questions:[{q, options:[a,b,c,d], correct_index, explanation}]}.`,
          "You read images and generate quizzes. Respond with valid JSON only.",
          String(imageUrl),
        );
        result = { quiz: parseAIJson(text) };
        break;
      }


      // ---------- 3. Voice Quiz Battle ----------
      case "ai.voiceQuiz": {
        const topic = String(body.topic ?? "").trim();
        const transcript = String(body.transcript ?? "").trim();
        if (!topic) { const e: any = new Error("Please enter a topic."); e.status = 400; throw e; }
        if (!transcript) { const e: any = new Error("Please speak or type your answer first."); e.status = 400; throw e; }
        const { text } = await callAI(
          `Topic: "${topic}". Invent one short quiz question about this topic, then judge this spoken answer: "${transcript}". Return JSON {"question":string,"correct_answer":string,"user_correct":boolean,"score":0-100,"feedback":string}.`,
          "You are a quiz judge. Respond with valid JSON only."
        );
        result = { round: parseAIJson(text) };
        break;
      }


      // ---------- 4. AI Cheat Detection ----------
      case "ai.cheatScan": {
        const duelId = String(body.duelId ?? "").trim();
        if (!duelId) { const e: any = new Error("Please select a duel to scan."); e.status = 400; throw e; }

        const { data: match } = await admin
          .from("brain_duel_matches")
          .select("id,player1_id,player2_id,category,total_questions,player1_score,player2_score,finished_at")
          .eq("id", duelId)
          .maybeSingle();
        if (!match) { const e: any = new Error("Duel not found."); e.status = 404; throw e; }
        if (match.player1_id !== user.id && match.player2_id !== user.id) {
          const e: any = new Error("You can only scan duels you played."); e.status = 403; throw e;
        }

        // Derive real stats from stored answers (response times = deltas between answers).
        const { data: answers } = await admin
          .from("brain_duel_answers")
          .select("player_id,is_correct,answered_at")
          .eq("match_id", duelId)
          .order("answered_at", { ascending: true });

        const mine = (answers ?? []).filter((a: any) => a.player_id === user.id);
        const responseTimes: number[] = [];
        for (let i = 1; i < mine.length; i++) {
          responseTimes.push(
            new Date(mine[i].answered_at).getTime() - new Date(mine[i - 1].answered_at).getTime(),
          );
        }
        const correct = mine.filter((a: any) => a.is_correct).length;
        const accuracy = mine.length ? Math.round((correct / mine.length) * 100) : 0;

        if (!mine.length) { const e: any = new Error("This duel has no recorded answers to analyse yet."); e.status = 400; throw e; }

        const { text } = await callAI(
          `Analyze a quiz duel for cheating signals. Category: ${match.category ?? "general"}. Questions answered: ${mine.length}. Accuracy: ${accuracy}%. Time between answers (ms): ${JSON.stringify(responseTimes)}. Return JSON {"suspicious":boolean,"score":0-100,"reasons":[string]}.`,
          "You are a fair-play analyst. Respond with valid JSON only.",
        );
        result = { report: parseAIJson(text), stats: { answers: mine.length, accuracy, responseTimes } };
        break;
      }

      // Free helper: list the user's recent duels for the cheat-scan picker.
      case "duels.recent": {
        const { data } = await admin
          .from("brain_duel_matches")
          .select("id,category,player1_id,player2_id,winner_id,player1_score,player2_score,finished_at,created_at")
          .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
          .not("finished_at", "is", null)
          .order("finished_at", { ascending: false })
          .limit(20);
        result = { duels: await enrichDuelsWithProfiles(admin, data ?? []) };
        break;
      }

      // ---------- 5. Shareable Result Card ----------
      case "ai.shareCard": {
        let winner = String(body.winner ?? "").trim();
        let loser = String(body.loser ?? "").trim();
        let score = String(body.score ?? "").trim();
        let topic = String(body.topic ?? "").trim();

        const duelId = String(body.duelId ?? "").trim();
        if (duelId) {
          const { data: match } = await admin
            .from("brain_duel_matches")
            .select("id,category,player1_id,player2_id,winner_id,player1_score,player2_score,finished_at,created_at")
            .eq("id", duelId)
            .maybeSingle();
          if (!match) { const e: any = new Error("Duel not found."); e.status = 404; throw e; }
          if (match.player1_id !== user.id && match.player2_id !== user.id) {
            const e: any = new Error("You can only share duels you played."); e.status = 403; throw e;
          }
          if (!match.finished_at) { const e: any = new Error("Only finished duels can be shared."); e.status = 400; throw e; }
          const [enriched] = await enrichDuelsWithProfiles(admin, [match]);
          winner = enriched.winner_name;
          loser = enriched.loser_name;
          score = enriched.score_label;
          topic = enriched.category ?? topic;
        }

        if (!winner || !loser || !score || !topic) {
          const e: any = new Error("Pick a finished duel or fill winner, loser, score and topic.");
          e.status = 400;
          throw e;
        }
        const { text } = await callAI(
          `Create Instagram story copy for Brain Duel result. Winner: ${winner}, loser: ${loser}, score: ${score}, topic: ${topic}. Return JSON {headline, caption, hashtags:[]}.`
        );
        result = { card: parseAIJson(text), source: { winner, loser, score, topic } };
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
        const title = String(body.title ?? "").trim();
        const topic = String(body.topic ?? "").trim();
        const rawQuestions = Array.isArray(body.questions) ? body.questions : [];
        if (!title) { const e: any = new Error("Please enter a deck title."); e.status = 400; throw e; }
        if (!topic) { const e: any = new Error("Please enter a topic."); e.status = 400; throw e; }
        const questions = rawQuestions.map((question: any) => ({
          q: String(question?.q ?? question?.question ?? "").trim(),
          options: Array.isArray(question?.options)
            ? question.options.map((option: unknown) => String(option ?? "").trim()).filter(Boolean).slice(0, 6)
            : [],
          correct_index: Number.isInteger(question?.correct_index) ? question.correct_index : Number(question?.correct_index ?? 0),
          explanation: question?.explanation ? String(question.explanation).trim().slice(0, 500) : undefined,
        })).filter((question: any) => question.q && question.options.length >= 2);
        if (!questions.length) { const e: any = new Error("Add at least one complete question with two answers."); e.status = 400; throw e; }
        const normalizedQuestions = questions.map((question: any) => ({
          ...question,
          correct_index: question.correct_index >= 0 && question.correct_index < question.options.length ? question.correct_index : 0,
        }));
        const { data, error } = await admin.from("brain_duel_records")
          .insert({ user_id: user.id, kind: "custom_deck", payload: { title: title.slice(0, 120), topic: topic.slice(0, 80), questions: normalizedQuestions }, is_public: true })
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
    } catch (actionErr: any) {
      // Refund the credits we already deducted when the action itself fails.
      if (cost > 0) {
        try { await admin.rpc("add_ai_credits", { p_user_id: user.id, p_amount: cost, p_reason: "brain_duel_router_refund", p_source: "brain_duel" }); } catch { /* noop */ }
      }
      throw actionErr;
    }


    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    const status = err?.status ?? 500;
    return new Response(JSON.stringify({ error: err?.message ?? "Server error" }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
