import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { action, ...params } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("API key not configured");
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    
    let result: any;
    switch (action) {
      case "advisor":
        result = await callAI(apiKey, [
          { role: "system", content: "You are an AI collection advisor for digital collectibles. Analyze the user's collection and provide strategic recommendations. Return JSON with: overview, recommendations, missingPieces, strategy." },
          { role: "user", content: `Analyze this collector's portfolio:\n${collectionSummary}\nProvide personalized advice.` }
        ]);
        break;
      case "box-simulate":
        result = await callAI(apiKey, [
          { role: "system", content: "You simulate mystery box openings for a digital collectibles platform. Generate 5 simulated results with varying rarities. Return JSON: { simulations: [{ itemName, category, rarity }] }" },
          { role: "user", content: prompt || "Simulate a mystery box opening" }
        ]);
        break;
      case "customize":
        result = await callAI(apiKey, [{ role: "user", content: prompt }]);
        break;
      case "price-alert":
        result = await callAI(apiKey, [{ role: "user", content: prompt }]);
        break;
      case "rarity-predict":
        result = await callAI(apiKey, [
          { role: "system", content: "You are an AI collectibles expert. Analyze digital collectible items and predict their rarity trajectory, future value, and market demand. Return JSON with fields: currentRarity, predictedRarity, valueEstimate, analysis, investmentTip." },
          { role: "user", content: `Analyze this collectible:\nName: ${params.itemName}\nDescription: ${itemDescription || "No description provided"}` }
        ]);
        break;
      default: throw new Error(`Unknown action: ${action}`);
    }
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});