import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl, question } = await req.json();
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
    if (!credits || credits.credits_remaining < 10) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a seasoned antique dealer with 30+ years of experience in European and Asian antiques. Provide a comprehensive expert consultation including: 1) Professional identification and classification, 2) Detailed condition assessment with grading (Excellent/Very Good/Good/Fair/Poor), 3) Current fair market value and insurance value, 4) Buying advice - is it worth the investment?, 5) Selling strategy - best auction houses, dealers, or platforms, 6) Market positioning - rarity and demand analysis, 7) Red flags or concerns, 8) Comparable sales from major auction houses, 9) Preservation and storage recommendations. ${question ? `The collector specifically asks: "${question}"` : ""} Format as a professional consultation report with markdown headers.` },
          { role: "user", content: [
            { type: "text", text: "Please provide your expert dealer opinion on this antique:" },
            { type: "image_url", image_url: { url: imageUrl } }
          ]}
        ],
        max_tokens: 2000,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "Unable to consult.";

    await supabase.from("antique_credits").update({
      credits_remaining: credits.credits_remaining - 10
    }).eq("user_id", user.id);

    return new Response(JSON.stringify({ analysis }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
