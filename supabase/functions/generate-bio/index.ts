import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, occupation, company, location, interests, skills, tone } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const toneHint = (tone || "warm").toLowerCase();
    const toneMap: Record<string, string> = {
      warm: "warm, friendly and approachable",
      professional: "polished, professional and confident",
      playful: "playful, witty and creative",
      bold: "bold, energetic and ambitious",
      minimal: "minimal, calm and understated",
    };

    const prompt = `Write a short personal "About Me" bio (max 280 characters, 2-3 sentences) in ${toneMap[toneHint] || toneMap.warm} tone, written in first person, in English.

User context:
- Name: ${name || "(not provided)"}
- Occupation: ${occupation || "(not provided)"}
- Company: ${company || "(not provided)"}
- Location: ${location || "(not provided)"}
- Interests: ${(interests && interests.length ? interests.join(", ") : "(not provided)")}
- Skills: ${(skills && skills.length ? skills.map((s: any) => s.name || s).join(", ") : "(not provided)")}

Output ONLY the bio text. No quotes, no labels, no markdown.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a concise personal-branding copywriter who writes short profile bios." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "OpenAI credits exhausted. Add funds to your OpenAI account." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("OpenAI API error:", response.status, t);
      throw new Error("OpenAI API error");
    }

    const data = await response.json();
    const bio = (data.choices?.[0]?.message?.content || "").trim().replace(/^["']|["']$/g, "");

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
