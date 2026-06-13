import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, content } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "trending_topics") {
      systemPrompt = "You are a community forum trend analyst. Generate 6 trending discussion topics that would spark engaging community debates. Return JSON with a 'topics' array where each has: title, description, emoji, tags (array of 2-3 tags), engagement (High/Medium/Very High).";
      userPrompt = "Generate 6 trending forum discussion topics across technology, culture, lifestyle, science, entertainment, and current events. Make them thought-provoking and debate-worthy.";
    } else if (action === "summarize") {
      systemPrompt = "You are a discussion thread summarizer. Create a concise, well-structured summary of the provided discussion. Highlight key points, areas of agreement, areas of disagreement, and any conclusions reached.";
      userPrompt = `Summarize this discussion thread:\n\n${content}`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    if (action === "trending_topics") {
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { topics: [] };
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ topics: [{ title: "AI Generated Topic", description: text, emoji: "💡", tags: ["ai"], engagement: "High" }] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      return new Response(JSON.stringify({ summary: text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("megaforum-ai error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
