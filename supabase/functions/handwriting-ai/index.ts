// Router edge function – consolidates 8 handwriting AI tools into one slot.
// Dispatch via { action: "signature" | "compatibility" | "mood" | "forgery"
//                       | "twin" | "famous" | "academy" | "pdf-report", ...payload }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(body: unknown) {
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 429) throw new Error("Rate limited");
  if (res.status === 402) throw new Error("AI credits exhausted");
  if (!res.ok) throw new Error(`AI error ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function chargeCredits(supabase: any, userId: string, cost: number) {
  const { data: credits } = await supabase
    .from("handwriting_credits")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (!credits || (credits.credits_remaining ?? 0) < cost) {
    throw new Error("Insufficient credits");
  }
  await supabase
    .from("handwriting_credits")
    .update({ credits_remaining: credits.credits_remaining - cost })
    .eq("user_id", userId);
  return credits;
}

function cosine(a: Record<string, number>, b: Record<string, number>) {
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
  let dot = 0, na = 0, nb = 0;
  for (const k of keys) {
    const av = a?.[k] ?? 0, bv = b?.[k] ?? 0;
    dot += av * bv; na += av * av; nb += bv * bv;
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const action = body.action as string;
    if (!action) return json({ error: "action required" }, 400);

    // ---------- SIGNATURE (5 cr) ----------
    if (action === "signature") {
      const { imageUrl } = body;
      if (!imageUrl) return json({ error: "imageUrl required" }, 400);
      await chargeCredits(supabase, user.id, 5);
      const content = await callAI({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a forensic graphologist specializing in signature analysis. Return strict JSON: { ego_score: 0-100, confidence_score: 0-100, public_persona: string, authenticity_score: 0-100, traits: string[], dominance: string, summary: string }." },
          { role: "user", content: [
            { type: "text", text: "Analyze this signature." },
            { type: "image_url", image_url: { url: imageUrl } },
          ] },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(content);
      const { data: row } = await supabase.from("handwriting_signature_analyses").insert({
        user_id: user.id, image_url: imageUrl,
        ego_score: parsed.ego_score, confidence_score: parsed.confidence_score,
        public_persona: parsed.public_persona, authenticity_score: parsed.authenticity_score,
        analysis: parsed, credits_used: 5,
      }).select().single();
      return json({ analysis: row });
    }

    // ---------- COMPATIBILITY (12 cr) ----------
    if (action === "compatibility") {
      const { imageAUrl, imageBUrl, context = "romantic" } = body;
      if (!imageAUrl || !imageBUrl) return json({ error: "Two images required" }, 400);
      await chargeCredits(supabase, user.id, 12);
      const content = await callAI({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: `You are a graphology compatibility expert. Compare two handwriting samples for ${context} compatibility. Return JSON: { compatibility_score: 0-100, dynamics: { communication, emotional, decision, conflict }, strengths: string[], challenges: string[], full_report: string }.` },
          { role: "user", content: [
            { type: "text", text: `Compare these two handwriting samples for ${context} compatibility.` },
            { type: "image_url", image_url: { url: imageAUrl } },
            { type: "image_url", image_url: { url: imageBUrl } },
          ] },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(content);
      const { data: row } = await supabase.from("handwriting_compatibility_matches").insert({
        user_id: user.id, image_a_url: imageAUrl, image_b_url: imageBUrl, context,
        compatibility_score: parsed.compatibility_score, dynamics: parsed.dynamics,
        strengths: parsed.strengths, challenges: parsed.challenges,
        full_report: parsed.full_report, credits_used: 12,
      }).select().single();
      return json({ result: row });
    }

    // ---------- MOOD (3 cr) ----------
    if (action === "mood") {
      const { imageUrl, notes } = body;
      if (!imageUrl) return json({ error: "imageUrl required" }, 400);
      await chargeCredits(supabase, user.id, 3);
      const content = await callAI({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a graphology mood analyst. Analyze handwriting for current emotional state. Return JSON: { mood_score: 0-100, stress_score: 0-100, energy_score: 0-100, focus_score: 0-100, ai_insight: short paragraph }." },
          { role: "user", content: [
            { type: "text", text: notes ? `Notes: ${notes}` : "Daily mood scan." },
            { type: "image_url", image_url: { url: imageUrl } },
          ] },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(content);
      const { data: row } = await supabase.from("handwriting_mood_scans").insert({
        user_id: user.id, image_url: imageUrl, notes,
        mood_score: parsed.mood_score, stress_score: parsed.stress_score,
        energy_score: parsed.energy_score, focus_score: parsed.focus_score,
        ai_insight: parsed.ai_insight, credits_used: 3,
      }).select().single();
      return json({ scan: row });
    }

    // ---------- FORGERY (15 cr) ----------
    if (action === "forgery") {
      const { referenceUrl, suspectUrl } = body;
      if (!referenceUrl || !suspectUrl) return json({ error: "Two images required" }, 400);
      await chargeCredits(supabase, user.id, 15);
      const content = await callAI({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: "You are a court-grade forensic document examiner. Compare reference vs suspect signature/handwriting. Return strict JSON: { authenticity_probability: 0-100, forgery_probability: 0-100, verdict: 'AUTHENTIC'|'LIKELY_AUTHENTIC'|'SUSPICIOUS'|'LIKELY_FORGERY'|'FORGERY', red_flags: [{trait, severity}], matching_traits: [{trait, similarity}], detailed_report: string }." },
          { role: "user", content: [
            { type: "text", text: "First image is the REFERENCE (known authentic). Second image is the SUSPECT sample." },
            { type: "image_url", image_url: { url: referenceUrl } },
            { type: "image_url", image_url: { url: suspectUrl } },
          ] },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(content);
      const { data: row } = await supabase.from("handwriting_forgery_checks").insert({
        user_id: user.id, reference_url: referenceUrl, suspect_url: suspectUrl,
        authenticity_probability: parsed.authenticity_probability,
        forgery_probability: parsed.forgery_probability,
        verdict: parsed.verdict, red_flags: parsed.red_flags,
        matching_traits: parsed.matching_traits, detailed_report: parsed.detailed_report,
        credits_used: 15,
      }).select().single();
      return json({ check: row });
    }

    // ---------- TWIN FINDER (5 cr) ----------
    if (action === "twin") {
      const { imageUrl, displayName, isPublic = true } = body;
      if (!imageUrl || !displayName) return json({ error: "imageUrl and displayName required" }, 400);
      await chargeCredits(supabase, user.id, 5);
      const content = await callAI({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Extract a numeric trait vector for handwriting matching. Return JSON: { vector: { slant, pressure, size, spacing, loops, angularity, speed, regularity, baseline, creativity, extroversion, analytical }, summary: string } where each value is 0..100." },
          { role: "user", content: [{ type: "image_url", image_url: { url: imageUrl } }] },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(content);
      await supabase.from("handwriting_twin_profiles").upsert({
        user_id: user.id, display_name: displayName, sample_url: imageUrl,
        trait_vector: parsed.vector, is_public: isPublic, updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      const { data: others } = await supabase
        .from("handwriting_twin_profiles")
        .select("user_id, display_name, sample_url, trait_vector")
        .neq("user_id", user.id).eq("is_public", true).limit(200);
      const matches = (others ?? []).map((o: any) => ({
        ...o, similarity: Math.round(cosine(parsed.vector, o.trait_vector as any) * 100),
      })).sort((a: any, b: any) => b.similarity - a.similarity).slice(0, 5);
      return json({ matches, your_summary: parsed.summary });
    }

    // ---------- FAMOUS COMPARISON (5 cr) ----------
    if (action === "famous") {
      const { imageUrl } = body;
      if (!imageUrl) return json({ error: "imageUrl required" }, 400);
      await chargeCredits(supabase, user.id, 5);
      const content = await callAI({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Compare handwriting to famous historical figures (Einstein, Napoleon, Mozart, Marie Curie, Tesla, Da Vinci, Picasso, Hemingway). Pick best match. Return JSON: { matched_figure: string, match_score: 0-100, shared_traits: string[], ai_blurb: short fun paragraph }." },
          { role: "user", content: [{ type: "image_url", image_url: { url: imageUrl } }] },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(content);
      const { data: row } = await supabase.from("handwriting_famous_comparisons").insert({
        user_id: user.id, image_url: imageUrl,
        matched_figure: parsed.matched_figure, match_score: parsed.match_score,
        shared_traits: parsed.shared_traits, ai_blurb: parsed.ai_blurb, credits_used: 5,
      }).select().single();
      return json({ comparison: row });
    }

    // ---------- ACADEMY (free / quiz / complete) ----------
    if (action === "academy") {
      const sub = body.subAction as string;
      if (sub === "complete") {
        const { lessonId, quizScore } = body;
        const xp = Math.max(10, Math.round((quizScore ?? 50) / 10) * 5);
        await supabase.from("handwriting_academy_progress").upsert({
          user_id: user.id, lesson_id: lessonId, completed: true,
          quiz_score: quizScore, xp_earned: xp, completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,lesson_id" });
        return json({ ok: true, xp_earned: xp });
      }
      if (sub === "generate-quiz") {
        const { lessonId } = body;
        const content = await callAI({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "Generate a 5-question multiple-choice graphology quiz. Return JSON: { questions: [{ q, options: [string,string,string,string], correct: 0-3 }] }." },
            { role: "user", content: `Lesson topic: ${lessonId}` },
          ],
          response_format: { type: "json_object" },
        });
        return json(JSON.parse(content));
      }
      const { data } = await supabase
        .from("handwriting_academy_progress").select("*").eq("user_id", user.id);
      return json({ progress: data ?? [] });
    }

    // ---------- PDF REPORT (5 cr) ----------
    if (action === "pdf-report") {
      const { analysisId, source = "main" } = body;
      if (!analysisId) return json({ error: "analysisId required" }, 400);
      await chargeCredits(supabase, user.id, 5);
      const tableMap: Record<string, string> = {
        main: "handwriting_analyses",
        signature: "handwriting_signature_analyses",
        forgery: "handwriting_forgery_checks",
        compatibility: "handwriting_compatibility_matches",
      };
      const tbl = tableMap[source] ?? "handwriting_analyses";
      const { data: analysis } = await supabase
        .from(tbl).select("*").eq("id", analysisId).eq("user_id", user.id).maybeSingle();
      if (!analysis) return json({ error: "Analysis not found" }, 404);
      const summary = await callAI({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Write a forensic-grade executive summary for a handwriting analysis PDF report. Professional, court-ready tone, 250-400 words." },
          { role: "user", content: JSON.stringify(analysis).slice(0, 6000) },
        ],
      });
      const watermark = `UniqueApp Forensic · ${user.id.slice(0, 8)} · ${new Date().toISOString().slice(0, 10)}`;
      const { data: report } = await supabase.from("handwriting_pdf_reports").insert({
        user_id: user.id, source_analysis_id: analysisId, report_type: source,
        watermark, status: "ready", credits_used: 5,
      }).select().single();
      return json({ report, summary, watermark, source_data: analysis });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    console.error("[handwriting-ai]", msg);
    const status = msg.includes("Insufficient") ? 402
      : msg.includes("Rate limited") ? 429
      : msg.includes("AI credits") ? 402
      : msg.includes("Unauthorized") ? 401 : 500;
    return json({ error: msg }, status);
  }
});
