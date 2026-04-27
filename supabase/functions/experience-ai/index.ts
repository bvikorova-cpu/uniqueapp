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
  if (!response.ok) throw new Error("AI error: " + response.status);
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  try { return JSON.parse(content); } catch { return { result: content }; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { action, ...p } = body;
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("API key not configured");
    let result: any;
    switch (action) {
      case "destination-recommender":
        result = await callAI(apiKey, [
          { role: "system", content: "You are an expert travel advisor. Recommend destinations based on user preferences. Always respond in valid JSON format with a recommendations array." },
          { role: "user", content: "Recommend 5 travel destinations based on these preferences: Travel style: " + p.travelStyle + ", Climate: " + p.climate + ", Budget: " + p.budgetLevel + ", Interests: " + ((p.interests || []).join(", ") || "general") + ". Return JSON: { recommendations: [{ destination, description, match_score, best_season, highlights }] }" }
        ]);
        break;
      case "travel-planner":
        result = await callAI(apiKey, [
          { role: "system", content: "You are an expert travel planner. Create detailed, personalized travel itineraries. Always respond in valid JSON format." },
          { role: "user", content: "Create a " + p.days + "-day travel itinerary for " + p.destination + ". Budget level: " + p.budget + ". Interests: " + ((p.interests || []).join(", ") || "general") + ". Return JSON: { title, overview, days: [{ theme, morning, afternoon, evening, food_tip, culture_tip }] }" }
        ]);
        break;
      case "virtual-postcard":
        result = await callAI(apiKey, [
          { role: "system", content: "You are a creative postcard writer. Write beautiful, evocative postcard text in a " + (p.style || "poetic") + " style. Include vivid descriptions. Keep it 100-200 words." },
          { role: "user", content: "Write a " + (p.style || "poetic") + " postcard from " + p.destination + " to " + p.recipientName + ". The sender's personal message: " + p.message }
        ]);
        break;
      default: throw new Error("Unknown action: " + action);
    }
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
