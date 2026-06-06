// Dating AI Coach: conversation_starter (A/B), bio_coach, rerank_discovery
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(messages: any[], json = false, model = "google/gemini-2.5-flash") {
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
  const body: any = { model, messages };
  if (json) body.response_format = { type: "json_object" };
  const r = await fetch(AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (r.status === 429) throw new Error("Rate limit, try again shortly");
  if (r.status === 402) throw new Error("AI credits exhausted");
  if (!r.ok) throw new Error(`AI error ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function pickWeighted<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((s, i) => s + (i.weight || 1), 0);
  let r = Math.random() * total;
  for (const it of items) { r -= (it.weight || 1); if (r <= 0) return it; }
  return items[0];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: au } = await userClient.auth.getUser();
    const user = au?.user;
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const payload = await req.json();
    const action = payload.action;

    // ============ CONVERSATION STARTER (A/B) ============
    if (action === "conversation_starter") {
      const { matchId, matchProfile, recentMessages = [] } = payload;
      const { data: variants } = await admin
        .from("dating_ai_prompt_variants")
        .select("variant_key, prompt, weight")
        .eq("feature", "conversation_starter")
        .eq("active", true);
      if (!variants || variants.length === 0) throw new Error("No active variants");
      const chosen = pickWeighted(variants as any);

      const profileSummary = matchProfile
        ? `Name: ${matchProfile.display_name || "?"}; Age: ${matchProfile.age || "?"}; Bio: ${matchProfile.bio || "(none)"}; Interests: ${(matchProfile.interests || []).join(", ") || "(none)"}; Location: ${matchProfile.location || "(none)"}`
        : "Unknown profile";
      const history = recentMessages.length
        ? `Recent chat:\n${recentMessages.slice(-6).map((m: any) => `${m.mine ? "me" : "them"}: ${m.content}`).join("\n")}`
        : "No messages yet.";

      const raw = await callAI([
        { role: "system", content: chosen.prompt },
        { role: "user", content: `${profileSummary}\n\n${history}\n\nReturn STRICT JSON: {"starters":["..","..",".."]}` },
      ], true);
      let starters: string[] = [];
      try { starters = JSON.parse(raw).starters || []; } catch { starters = []; }
      starters = starters.filter(Boolean).slice(0, 3);

      const { data: exp } = await admin.from("dating_ai_experiments").insert({
        user_id: user.id,
        feature: "conversation_starter",
        variant_key: chosen.variant_key,
        match_id: matchId || null,
        metadata: { starters },
      }).select("id").maybeSingle();

      return new Response(JSON.stringify({ starters, variant_key: chosen.variant_key, experiment_id: exp?.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============ MARK EXPERIMENT USED / REPLIED ============
    if (action === "mark_experiment") {
      const { experiment_id, used, led_to_message, led_to_reply } = payload;
      if (!experiment_id) throw new Error("experiment_id required");
      const patch: any = { updated_at: new Date().toISOString() };
      if (typeof used === "boolean") patch.used = used;
      if (typeof led_to_message === "boolean") patch.led_to_message = led_to_message;
      if (typeof led_to_reply === "boolean") patch.led_to_reply = led_to_reply;
      const { error } = await userClient.from("dating_ai_experiments").update(patch).eq("id", experiment_id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ============ BIO COACH ============
    if (action === "bio_coach") {
      const { bio, profile } = payload;
      if (!bio) throw new Error("bio required");
      const ctx = profile
        ? `Profile type: age ${profile.age}, gender ${profile.gender}, looking for ${profile.looking_for}, interests: ${(profile.interests || []).join(", ")}, location ${profile.location || "?"}.`
        : "";
      const raw = await callAI([
        { role: "system", content: `You are an elite dating profile coach. Analyze the bio and return STRICT JSON:
{"score":0-100,"strengths":["..","..",".."],"weaknesses":["..","..",".."],"tips":["..","..","..","..",".."],"rewrites":[{"label":"Warm","text":"..."},{"label":"Playful","text":"..."},{"label":"Confident","text":"..."}]}
Tips MUST be concrete and tailored to the profile type. Rewrites MUST be under 280 chars each.` },
        { role: "user", content: `${ctx}\n\nBIO:\n"${bio}"` },
      ], true);
      let parsed: any = {};
      try { parsed = JSON.parse(raw); } catch { parsed = { score: 50, strengths: [], weaknesses: [], tips: [], rewrites: [] }; }
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ============ DISCOVERY RE-RANK ============
    if (action === "rerank_discovery") {
      const { me, candidates } = payload;
      if (!Array.isArray(candidates) || candidates.length === 0) {
        return new Response(JSON.stringify({ scores: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const slim = candidates.slice(0, 40).map((c: any) => ({
        id: c.user_id,
        age: c.age, gender: c.gender, looking_for: c.looking_for,
        interests: c.interests || [],
        bio: (c.bio || "").slice(0, 200),
        verified: !!c.photo_verified,
        has_voice: !!c.voice_intro_url,
        prompts: Array.isArray(c.prompts) ? c.prompts.length : 0,
      }));
      const myCtx = me ? {
        age: me.age, gender: me.gender, looking_for: me.looking_for,
        interests: me.interests || [], bio: (me.bio || "").slice(0, 200),
      } : {};
      const raw = await callAI([
        { role: "system", content: `You predict like→match probability for a dating app. Given the viewer profile and candidate profiles, score each candidate 0-100 reflecting the probability the viewer will like AND the candidate will like back (mutual match). Reward shared interests, compatible age/orientation, profile completeness, and conversation potential. Return STRICT JSON: {"scores":[{"id":"...","p":0-100}]}.` },
        { role: "user", content: `Viewer:\n${JSON.stringify(myCtx)}\n\nCandidates:\n${JSON.stringify(slim)}` },
      ], true, "google/gemini-2.5-flash-lite");
      let scores: any[] = [];
      try { scores = JSON.parse(raw).scores || []; } catch { scores = []; }
      return new Response(JSON.stringify({ scores }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (e: any) {
    console.error("dating-ai-coach error", e);
    return new Response(JSON.stringify({ error: e.message || "error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
