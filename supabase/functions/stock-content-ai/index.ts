import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, imageUrl, prompt, style, category, bgColor } = await req.json();
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "plagiarism_scan":
        systemPrompt = "You are an AI image originality analyzer. Analyze the described image and return a JSON object with: originalityScore (0-100), matches (array of {source, similarity, url}), verdict (string), details (string). Be realistic with scoring.";
        userPrompt = `Analyze this image for originality: ${imageUrl}. Return a realistic plagiarism scan result as JSON.`;
        break;

      case "remove_background":
        systemPrompt = "You are an AI image processing assistant. Simulate background removal results.";
        userPrompt = `Process background removal for image: ${imageUrl} with replacement: ${bgColor}. Return JSON with resultUrl (use the original URL as placeholder).`;
        break;

      case "generate_tags":
        systemPrompt = "You are an AI content tag generator. Analyze content and suggest relevant tags.";
        userPrompt = `Generate tags for: ${prompt}. Return JSON with tags (array of strings), categories (array), keywords (array).`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI error:", err);
      throw new Error("AI processing failed");
    }

    const aiData = await response.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("stock-content-ai error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
