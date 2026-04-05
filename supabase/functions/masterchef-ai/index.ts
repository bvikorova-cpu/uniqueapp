import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callAI(apiKey: string, messages: any[]) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages }),
  });
  if (!response.ok) throw new Error(`AI error: ${response.status}`);
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  try { return JSON.parse(content); } catch { return { result: content }; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, prompt, image, ...params } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("API key not configured");
    let result: any;
    switch (action) {
      case "ai-coach":
        result = await callAI(apiKey, [{ role: 'system', content: 'You are a professional cooking coach.' }, { role: 'user', content: prompt || "" }]);
        break;
      case "ai-recipe":
        result = await callAI(apiKey, [{ role: 'system', content: 'You are a professional chef.' }, { role: 'user', content: prompt || "" }]);
        break;
      case "nutrition-analyze":
        result = await callAI(apiKey, [{ role: 'system', content: 'You are a nutritionist and food scientist.' }, { role: 'user', content: prompt || "" }]);
        break;
      case "scan-ingredients":
        result = await callAI(apiKey, [
          { role: 'system', content: 'You are a professional chef and food expert. Identify all ingredients in the image and suggest 3 dishes that could be made with them. For each dish, provide a brief recipe outline.' },
          { role: 'user', content: image ? [{ type: 'image_url', image_url: { url: image } }, { type: 'text', text: 'Identify all ingredients in this image and suggest 3 dishes I can make with them. Include brief recipes.' }] : (prompt || "List common ingredients") }
        ]);
        break;
      default: throw new Error(`Unknown action: ${action}`);
    }
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
