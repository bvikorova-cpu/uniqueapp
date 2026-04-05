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
    const { action, ...params } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("API key not configured");
    let result: any;
    switch (action) {
      case "destination-recommender":
        result = await callAI(apiKey, [
          {
            role: "system",
            content: "You are an expert travel advisor. Recommend destinations based on user preferences. Always respond in valid JSON format."
          },
          {
            role: "user",
            content: `Recommend 5 travel destinations based on these preferences:
            - Travel style: ${params.travelStyle}
            - Climate: ${params.climate}
            - Budget: ${params.budgetLevel}
            - Interests: ${interests?.join(", ") || "general"}
            
            Return JSON: { "recommendations": [{ "destination": "string", "description": "string (2-3 sentences)", "match_score": number (70-99), "best_season": "string", "highlights": ["string", "string", "string"]);
        break;
      case "travel-planner":
        result = await callAI(apiKey, [
          {
            role: "system",
            content: "You are an expert travel planner. Create detailed, personalized travel itineraries. Always respond in valid JSON format."
          },
          {
            role: "user",
            content: `Create a ${params.days}-day travel itinerary for ${params.destination}. Budget level: ${params.budget}. Interests: ${interests?.join(", ") || "general"}. 
            
            Return JSON: { "title": "string", "overview": "string", "days": [{ "theme": "string", "morning": "string", "afternoon": "string", "evening": "string", "food_tip": "string", "culture_tip": "string" }]);
        break;
      case "virtual-postcard":
        result = await callAI(apiKey, [
          {
            role: "system",
            content: `You are a creative postcard writer. Write beautiful, evocative postcard text in a ${params.style} style. Include vivid descriptions of the destination. Keep it concise (100-200 words).`
          },
          {
            role: "user",
            content: `Write a ${params.style} postcard from ${params.destination} to ${params.recipientName}. The sender's personal message: "${params.message}". Create a beautiful postcard text that combines the destination's atmosphere with the personal message.`
          }
        ]);
        break;
      default: throw new Error(`Unknown action: ${action}`);
    }
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});