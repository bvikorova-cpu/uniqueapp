import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { antiqueImageUrl, roomImageUrl } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { data: credits } = await supabase.from("antique_credits").select("*").eq("user_id", user.id).single();
    if (!credits || credits.credits_remaining < 8) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert interior designer specializing in antique placement. Analyze the antique item and room, then provide: 1) Optimal placement recommendations (specific locations in the room), 2) Style compatibility score (0-100), 3) Color harmony analysis, 4) Lighting recommendations, 5) Complementary decor suggestions, 6) Period-appropriate styling tips, 7) Dos and don'ts for displaying this antique, 8) Alternative room arrangements. Format with markdown headers." },
          { role: "user", content: [
            { type: "text", text: "Analyze how this antique would look in this room and provide placement recommendations:" },
            { type: "image_url", image_url: { url: antiqueImageUrl } },
            { type: "image_url", image_url: { url: roomImageUrl } }
          ]}
        ],
        max_tokens: 1500,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "Unable to analyze.";

    await supabase.from("antique_credits").update({
      credits_remaining: credits.credits_remaining - 8
    }).eq("user_id", user.id);

    return new Response(JSON.stringify({ analysis }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
