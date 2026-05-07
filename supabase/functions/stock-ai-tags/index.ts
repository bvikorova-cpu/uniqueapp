// AI Tag Suggester for Stock Content
// Uses Lovable AI Gateway (gemini-2.5-flash) to extract tags, category, and keywords
// from an uploaded image (data URL) or a text description.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  imageDataUrl?: string;
  description?: string;
  language?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageDataUrl, description, language = "en" }: Body = await req.json();
    if (!imageDataUrl && !description) {
      return new Response(JSON.stringify({ error: "Provide imageDataUrl or description" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an expert stock-content metadata specialist. Analyze the input and produce SEO-optimized metadata for a stock photo / video / illustration marketplace.
Respond ONLY with valid JSON matching this schema (no markdown, no commentary):
{
  "title": "string, 4-8 words, descriptive",
  "category": "one of: photography, illustration, video, vector, 3d, audio, template, ui",
  "subcategory": "string, more specific",
  "tags": ["array of 12-20 lowercase single or two-word tags"],
  "keywords": ["array of 5-8 SEO keywords/phrases"],
  "mood": "string e.g. cheerful, dramatic, calm",
  "color_palette": ["array of 3-5 dominant color names"],
  "best_use_cases": ["array of 3-5 short use case phrases"]
}
Output language for human-readable fields: ${language}. Tags & keywords always in English for global discoverability.`;

    const userContent: any[] = [];
    if (description) userContent.push({ type: "text", text: `Description: ${description}` });
    if (imageDataUrl) userContent.push({ type: "image_url", image_url: { url: imageDataUrl } });
    if (!description) userContent.unshift({ type: "text", text: "Analyze this image:" });

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Top up your Lovable AI workspace." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const txt = await aiResp.text();
      return new Response(JSON.stringify({ error: `AI gateway error: ${txt}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const raw: string = aiData?.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    let parsed: any;
    try { parsed = JSON.parse(cleaned); }
    catch { parsed = { title: "", category: "photography", tags: [], keywords: [], raw: cleaned }; }

    return new Response(JSON.stringify({ result: parsed }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
