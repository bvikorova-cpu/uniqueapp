import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!userData?.user) throw new Error("Unauthorized");

    const { imageDataUrl, imageUrl, queryText } = await req.json();

    const userContent: any[] = [];
    if (queryText) {
      userContent.push({ type: "text", text: `Extract 8-12 short visual search keywords (single words, English, lowercase) for: "${queryText}". Return ONLY a comma-separated list, no other text.` });
    } else {
      userContent.push({ type: "text", text: "Look at this image and return 8-12 short visual search keywords (single words, English, lowercase) describing subject, style, color, mood, composition. Return ONLY a comma-separated list, no other text." });
      userContent.push({ type: "image_url", image_url: { url: imageDataUrl || imageUrl } });
    }

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userContent }],
      }),
    });

    if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Skús neskôr." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return new Response(JSON.stringify({ error: `OpenAI error: ${t}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiRes.json();
    const text: string = aiData?.choices?.[0]?.message?.content || "";
    const keywords = text.split(/[,\n]/).map(s => s.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "")).filter(s => s.length > 1).slice(0, 15);

    if (keywords.length === 0) {
      return new Response(JSON.stringify({ keywords: [], results: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: items } = await supabase
      .from("stock_content_items")
      .select("*")
      .eq("is_active", true)
      .limit(500);

    const scored = (items || []).map((it: any) => {
      const hay = [it.title, it.description, it.category, ...(it.tags || [])].filter(Boolean).join(" ").toLowerCase();
      let score = 0;
      keywords.forEach(k => { if (hay.includes(k)) score += 1; });
      return { ...it, _score: score };
    }).filter(i => i._score > 0).sort((a, b) => b._score - a._score).slice(0, 24);

    return new Response(JSON.stringify({ keywords, results: scored }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Search failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
