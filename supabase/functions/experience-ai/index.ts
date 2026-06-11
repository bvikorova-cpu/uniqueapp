import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CREDIT_COSTS: Record<string, number> = {
  "destination-recommender": 3,
  "travel-planner": 4,
  "virtual-postcard": 3,
  "virtual-tour": 5,
  "age-progression": 5,
};

async function callAI(apiKey: string, messages: any[]) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages }),
  });
  if (!response.ok) {
    const status = response.status === 429 ? 429 : 500;
    throw Object.assign(new Error(`AI error: ${response.status}`), { status });
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  try { return JSON.parse(content); } catch { return { result: content }; }
}

async function generateImage(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-image-1", prompt, n: 1, size: "1024x1024" }),
  });
  if (!response.ok) {
    const status = response.status === 429 ? 429 : 500;
    throw Object.assign(new Error(`Image error: ${response.status}`), { status });
  }
  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image returned");
  return `data:image/png;base64,${b64}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { action, ...p } = body;
    const cost = CREDIT_COSTS[action];
    if (!cost) {
      return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = await requireAiCredits(req, corsHeaders, { credits: cost, usageType: `experience_${action}` });
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase, deduct } = auth;

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: any;

    if (action === "destination-recommender") {
      result = await callAI(apiKey, [
        { role: "system", content: "You are an expert travel advisor. Recommend destinations based on user preferences. Always respond in valid JSON format with a recommendations array." },
        { role: "user", content: `Recommend 5 travel destinations. Style: ${p.travelStyle}, Climate: ${p.climate}, Budget: ${p.budgetLevel}, Interests: ${(p.interests || []).join(", ") || "general"}. Return JSON: { recommendations: [{ destination, description, match_score, best_season, highlights }] }` }
      ]);
    } else if (action === "travel-planner") {
      result = await callAI(apiKey, [
        { role: "system", content: "You are an expert travel planner. Always respond in valid JSON." },
        { role: "user", content: `Create a ${p.days}-day itinerary for ${p.destination}. Budget: ${p.budget}. Interests: ${(p.interests || []).join(", ") || "general"}. Return JSON: { title, overview, days: [{ theme, morning, afternoon, evening, food_tip, culture_tip }] }` }
      ]);
    } else if (action === "virtual-postcard") {
      result = await callAI(apiKey, [
        { role: "system", content: `You are a creative postcard writer. Write a ${p.style || "poetic"} postcard, 100-200 words.` },
        { role: "user", content: `Postcard from ${p.destination} to ${p.recipientName}. Personal note: ${p.message}` }
      ]);
    } else if (action === "virtual-tour") {
      const { destination } = p;
      if (!destination) throw new Error("destination required");
      const description = await callAI(apiKey, [
        { role: "system", content: "You are a virtual tour guide. Return JSON only." },
        { role: "user", content: `Create a vivid virtual tour of ${destination}. Return JSON: { title, overview, highlights: [string], experiences: [{ name, description }] }` }
      ]);
      const imageUrl = await generateImage(apiKey,
        `Stunning photorealistic travel scene of ${destination}, golden hour, cinematic, ultra detailed, 8k`
      );
      const { data: row } = await supabase!.from("virtual_tours").insert({
        user_id: user!.id, destination,
        description: description?.overview ?? description?.result ?? "",
        image_urls: [imageUrl], tour_data: description, credits_used: cost,
      }).select().single();
      result = { tour: row, imageUrl };
    } else if (action === "age-progression") {
      const { imageUrl: originalUrl, yearsForward } = p;
      if (!originalUrl || !yearsForward) throw new Error("imageUrl and yearsForward required");
      const agedUrl = await generateImage(apiKey,
        `Photorealistic age progression: same person, ${yearsForward} years older. Realistic aging: wrinkles, hair color, skin texture changes. Studio portrait, soft lighting, high detail. Reference photo: ${originalUrl}`
      );
      const desc = await callAI(apiKey, [
        { role: "system", content: "You are a forensic age-progression analyst. Return JSON." },
        { role: "user", content: `Describe expected changes after ${yearsForward} years. Return JSON: { summary, changes: [string], tips: [string] }` }
      ]);
      const { data: row } = await supabase!.from("age_progressions").insert({
        user_id: user!.id, original_image_url: originalUrl, aged_image_url: agedUrl,
        years_forward: Number(yearsForward), description: desc?.summary ?? "", credits_used: cost,
      }).select().single();
      result = { progression: row, agedUrl };
    }

    await deduct!().catch((e) => console.error("deduct failed:", e));
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    const status = e.status === 429 ? 429 : 500;
    return new Response(JSON.stringify({ error: e.message }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
