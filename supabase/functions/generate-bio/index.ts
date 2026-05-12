import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

async function openai(messages: any[], opts: { json?: boolean } = {}) {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
  const body: any = { model: "gpt-4o-mini", messages };
  if (opts.json) body.response_format = { type: "json_object" };
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    console.error("OpenAI error", r.status, t);
    if (r.status === 429) throw new Error("Rate limit exceeded. Please try again shortly.");
    if (r.status === 402) throw new Error("OpenAI credits exhausted.");
    throw new Error("OpenAI API error");
  }
  const data = await r.json();
  return (data.choices?.[0]?.message?.content || "").trim();
}

const toneMap: Record<string, string> = {
  warm: "warm, friendly and approachable",
  professional: "polished, professional and confident",
  playful: "playful, witty and creative",
  bold: "bold, energetic and ambitious",
  minimal: "minimal, calm and understated",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json();
    const action = payload.action || "generate";

    // ---------- SCORE ----------
    if (action === "score") {
      const { bio } = payload;
      if (!bio || typeof bio !== "string") throw new Error("bio is required");
      const raw = await openai([
        { role: "system", content: 'You evaluate personal profile bios. Respond ONLY with JSON: {"score": 0-100, "feedback": "short actionable tip in English (max 200 chars)"}' },
        { role: "user", content: `Evaluate this bio for clarity, personality, hook, and call-to-action:\n\n"${bio}"` },
      ], { json: true });
      let parsed: any = {};
      try { parsed = JSON.parse(raw); } catch { parsed = { score: 50, feedback: raw.slice(0, 200) }; }
      return new Response(JSON.stringify({ score: parsed.score ?? 50, feedback: parsed.feedback ?? "" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------- VARIANTS (A/B) ----------
    if (action === "variants") {
      const { bio, count = 3 } = payload;
      if (!bio) throw new Error("bio is required");
      const raw = await openai([
        { role: "system", content: `You generate A/B test variants of profile bios. Respond ONLY with JSON: {"variants": ["...", "..."]} — exactly ${count} variants, each max 280 chars, distinct tones.` },
        { role: "user", content: `Original bio:\n"${bio}"\n\nGenerate ${count} alternate versions.` },
      ], { json: true });
      let parsed: any = { variants: [] };
      try { parsed = JSON.parse(raw); } catch {}
      return new Response(JSON.stringify({ variants: parsed.variants || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------- TRANSLATE ----------
    if (action === "translate") {
      const { bio, target_lang } = payload;
      if (!bio || !target_lang) throw new Error("bio and target_lang required");
      const raw = await openai([
        { role: "system", content: "You translate short profile bios while preserving tone and personality. Output ONLY the translation, no labels." },
        { role: "user", content: `Translate this bio to ${target_lang}:\n\n"${bio}"` },
      ]);
      return new Response(JSON.stringify({ translation: raw.replace(/^["']|["']$/g, "") }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------- GENERATE (default, original behaviour) ----------
    const { name, occupation, company, location, interests, skills, tone } = payload;
    const toneHint = (tone || "warm").toLowerCase();
    const prompt = `Write a short personal "About Me" bio (max 280 characters, 2-3 sentences) in ${toneMap[toneHint] || toneMap.warm} tone, written in first person, in English.

User context:
- Name: ${name || "(not provided)"}
- Occupation: ${occupation || "(not provided)"}
- Company: ${company || "(not provided)"}
- Location: ${location || "(not provided)"}
- Interests: ${(interests && interests.length ? interests.join(", ") : "(not provided)")}
- Skills: ${(skills && skills.length ? skills.map((s: any) => s.name || s).join(", ") : "(not provided)")}

Output ONLY the bio text. No quotes, no labels, no markdown.`;

    const bio = (await openai([
      { role: "system", content: "You are a concise personal-branding copywriter who writes short profile bios." },
      { role: "user", content: prompt },
    ])).replace(/^["']|["']$/g, "");

    return new Response(JSON.stringify({ bio }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-bio function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
