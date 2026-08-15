import { requireAiCredits } from "../_shared/credit-check.ts";
import { callOpenAI } from "../_shared/openai.ts";
import { generateOpenAIImage } from "../_shared/unifiedAI.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

const CREDIT_COSTS: Record<string, number> = { "destination-recommender": 3,
  "travel-planner": 4,
  "virtual-postcard": 3,
  "virtual-tour": 5,
  "age-progression": 5 };

async function aiChat(messages: any[]) {
  const content = await callOpenAI({ messages, model: "gpt-4o-mini", max_completion_tokens: 1200 });
  try { return JSON.parse(content); } catch { return { result: content }; }
}

async function generateImage(prompt: string): Promise<string> {
  const data = await generateOpenAIImage(prompt);
  if (!data.b64_json) throw new Error("No image returned");
  return `data:image/png;base64,${data.b64_json}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { action, ...p } = body;
    const cost = CREDIT_COSTS[action];
    if (!cost) {
      return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const auth = await requireAiCredits(req, corsHeaders, { credits: cost, usageType: `experience_${action}` });
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase, deduct } = auth;

    let result: any;

    if (action === "destination-recommender") {
      result = await aiChat([
        { role: "system", content: "You are an expert travel advisor. Recommend destinations based on user preferences. Always respond in valid JSON format with a recommendations array." },
        { role: "user", content: `Recommend 5 travel destinations. Style: ${p.travelStyle}, Climate: ${p.climate}, Budget: ${p.budgetLevel}, Interests: ${(p.interests || []).join(", ") || "general"}. Return JSON: { recommendations: [{ destination, description, match_score, best_season, highlights }] }` }
      ]);
    } else if (action === "travel-planner") {
      result = await aiChat([
        { role: "system", content: "You are an expert travel planner. Always respond in valid JSON." },
        { role: "user", content: `Create a ${p.days}-day itinerary for ${p.destination}. Budget: ${p.budget}. Interests: ${(p.interests || []).join(", ") || "general"}. Return JSON: { title, overview, days: [{ theme, morning, afternoon, evening, food_tip, culture_tip }] }` }
      ]);
    } else if (action === "virtual-postcard") {
      result = await aiChat([
        { role: "system", content: `You are a creative postcard writer. Write a ${p.style || "poetic"} postcard, 100-200 words.` },
        { role: "user", content: `Postcard from ${p.destination} to ${p.recipientName}. Personal note: ${p.message}` }
      ]);
    } else if (action === "virtual-tour") {
      const { destination } = p;
      if (!destination) throw new Error("destination required");
      const description = await aiChat([
        { role: "system", content: "You are a virtual tour guide. Return JSON only." },
        { role: "user", content: `Create a vivid virtual tour of ${destination}. Return JSON: { title, overview, highlights: [string], experiences: [{ name, description }] }` }
      ]);
      const imageUrl = await generateImage(
        `Stunning photorealistic travel scene of ${destination}, daytime golden hour, cinematic, ultra detailed, 8k. ` +
        `Classical and historic architecture only, no readable brand logos, no billboards or brand signage, ` +
        `no trademarked characters or mascots, no theme-park attractions, no recognisable modern copyrighted buildings, no people's faces in focus`
      );
      const { data: row } = await supabase!.from("virtual_tours").insert({ user_id: user!.id, destination,
        description: description?.overview ?? description?.result ?? "",
        image_urls: [imageUrl], tour_data: description, credits_used: cost }).select().single();
      result = { tour: row, imageUrl };
    } else if (action === "age-progression") {
      const { imageUrl: originalUrl, yearsForward } = p;
      if (!originalUrl || !yearsForward) throw new Error("imageUrl and yearsForward required");
      const agedUrl = await generateImage(
        `Photorealistic age progression: same person, ${yearsForward} years older. Realistic aging: wrinkles, hair color, skin texture changes. Studio portrait, soft lighting, high detail. Reference photo: ${originalUrl}`
      );
      const desc = await aiChat([
        { role: "system", content: "You are a forensic age-progression analyst. Return JSON." },
        { role: "user", content: `Describe expected changes after ${yearsForward} years. Return JSON: { summary, changes: [string], tips: [string] }` }
      ]);
      const { data: row } = await supabase!.from("age_progressions").insert({ user_id: user!.id, original_image_url: originalUrl, aged_image_url: agedUrl,
        years_forward: Number(yearsForward), description: desc?.summary ?? "", credits_used: cost }).select().single();
      result = { progression: row, agedUrl };
    }

    await deduct!().catch((e) => console.error("deduct failed:", e));
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    const status = e.status === 429 ? 429 : 500;
    return new Response(JSON.stringify({ error: e.message }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
