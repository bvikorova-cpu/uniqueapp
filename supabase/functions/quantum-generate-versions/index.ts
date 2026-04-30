// Quantum Social — Generate alternate post versions using Lovable AI Gateway.
// One call per post returns N stylistic rewrites of the same base content.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VersionOut {
  tone: string;
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const baseContent: string = (body?.baseContent ?? "").toString().trim();
    const tonesRaw = Array.isArray(body?.tones) ? body.tones : [];
    const tones: string[] = tonesRaw
      .map((t: unknown) => String(t || "").trim().toLowerCase())
      .filter((t: string) => t.length > 0 && t.length <= 32)
      .slice(0, 6);

    if (!baseContent || baseContent.length < 1 || baseContent.length > 2000) {
      return new Response(
        JSON.stringify({ error: "baseContent must be 1–2000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (tones.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one tone required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemPrompt =
      "You are Quantum Social's reality engine. Rewrite the user's social-media post in multiple distinct tones. " +
      "Preserve the core meaning but adapt voice, vocabulary and rhythm so each version feels written by a different person. " +
      "Keep each version under 280 characters. Respond ONLY with strict JSON of shape " +
      `{"versions":[{"tone":"<tone>","content":"<rewrite>"}]}.`;

    const userPrompt =
      `Base post:\n"""${baseContent}"""\n\n` +
      `Generate exactly ${tones.length} versions, one per tone, in this order: ${tones.join(", ")}.`;

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(
        JSON.stringify({ error: "AI rate limit reached, try again shortly" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (aiResp.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted — please top up" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!aiResp.ok) {
      const errText = await aiResp.text();
      return new Response(
        JSON.stringify({ error: "AI gateway error", detail: errText.slice(0, 300) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiJson = await aiResp.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "{}";
    let parsed: { versions?: VersionOut[] } = {};
    try {
      parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      parsed = { versions: [] };
    }

    let versions: VersionOut[] = Array.isArray(parsed.versions) ? parsed.versions : [];

    // Safety: align with requested tones order; backfill if AI returned too few.
    versions = tones.map((tone, idx) => {
      const match =
        versions.find((v) => v.tone?.toLowerCase() === tone) ?? versions[idx];
      const content =
        (match?.content ?? "").toString().trim() ||
        `${baseContent} (${tone})`;
      return { tone, content: content.slice(0, 500) };
    });

    return new Response(JSON.stringify({ versions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err?.message ?? err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
