import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No auth" }, 401);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { sessionId } = await req.json().catch(() => ({ sessionId: null }));
    if (!sessionId || typeof sessionId !== "string") return json({ error: "sessionId is required" }, 400);

    const { data: session } = await admin
      .from("clone_dating_sessions")
      .select("id, clone_1_id, clone_2_id, status, session_data, compatibility_score")
      .eq("id", sessionId)
      .maybeSingle();
    if (!session) return json({ error: "Session not found" }, 404);

    const { data: clones } = await admin
      .from("personality_clones")
      .select("id, user_id, clone_name, personality_summary")
      .in("id", [session.clone_1_id, session.clone_2_id]);

    const owns = (clones ?? []).some((c) => c.user_id === user.id);
    if (!owns) return json({ error: "Forbidden" }, 403);

    // Already generated -> just return it.
    const existing = (session.session_data ?? {}) as Record<string, unknown>;
    if (session.status === "completed" && Array.isArray(existing.messages)) {
      return json({ ok: true, messages: existing.messages, summary: existing.summary, score: session.compatibility_score });
    }

    const a = (clones ?? []).find((c) => c.id === session.clone_1_id);
    const b = (clones ?? []).find((c) => c.id === session.clone_2_id);
    const nameA = a?.clone_name ?? "Clone A";
    const nameB = b?.clone_name ?? "Clone B";

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    let messages: { speaker: string; text: string }[] = [];
    let summary = "";
    let score = 60 + Math.floor(Math.random() * 35);

    if (apiKey) {
      const prompt = `Write a short speed-dating conversation between two AI personality clones.
Clone A: ${nameA}. Personality: ${a?.personality_summary ?? "friendly, curious"}.
Clone B: ${nameB}. Personality: ${b?.personality_summary ?? "warm, playful"}.
Return STRICT JSON only, no markdown:
{"messages":[{"speaker":"${nameA}","text":"..."},{"speaker":"${nameB}","text":"..."}],"summary":"2-3 sentences about the chemistry","score":0-100}
Use 8 alternating messages, each max 200 characters, in English.`;

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3.6-flash",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) {
        const payload = await res.json();
        const raw = payload?.choices?.[0]?.message?.content ?? "";
        const cleaned = String(raw).replace(/```json|```/g, "").trim();
        try {
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed.messages)) messages = parsed.messages.slice(0, 20);
          if (typeof parsed.summary === "string") summary = parsed.summary;
          if (typeof parsed.score === "number") score = Math.max(0, Math.min(100, Math.round(parsed.score)));
        } catch {
          summary = cleaned.slice(0, 800);
        }
      }
    }

    if (!messages.length) {
      messages = [
        { speaker: nameA, text: "Hi! I hear we only have ten minutes — what's the most interesting thing about you?" },
        { speaker: nameB, text: "I collect strange facts. Did you know octopuses have three hearts?" },
        { speaker: nameA, text: "Then we already have something in common: I love things that break the rules." },
        { speaker: nameB, text: "Rule-breakers make the best conversations. What keeps you up at night?" },
        { speaker: nameA, text: "Ideas I haven't finished yet. And you?" },
        { speaker: nameB, text: "Songs I can't stop humming. I think we'd get along." },
      ];
      if (!summary) summary = "Easy rhythm and shared curiosity — a promising first match.";
    }

    await admin
      .from("clone_dating_sessions")
      .update({
        status: "completed",
        compatibility_score: score,
        completed_at: new Date().toISOString(),
        session_data: { ...existing, messages, summary },
      })
      .eq("id", sessionId);

    return json({ ok: true, messages, summary, score });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
