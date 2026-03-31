import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const authHeader = req.headers.get("Authorization")!;
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) throw new Error("Not authenticated");

    const { data: credits } = await supabase.from("ai_credits").select("*").eq("user_id", user.id).single();
    if (!credits || credits.credits_remaining < 12) throw new Error("Insufficient credits (need 12)");

    const { category } = await req.json();
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a fashion trend radar analyst. Provide a comprehensive trend report: 1) 🔴 HOT NOW - Top 5 trending items/styles with virality score, 2) 🟡 EMERGING - 5 upcoming trends to watch, 3) 🟢 INVESTMENT PIECES - 3 items worth buying now, 4) 📉 DECLINING - styles losing momentum, 5) 🔮 PREDICTION - next big trend forecast, 6) Regional trend variations. Use emojis and markdown tables." },
          { role: "user", content: `Generate trend radar report for: ${category}` }
        ], max_tokens: 2500
      })
    });
    const aiData = await response.json();
    await supabase.from("ai_credits").update({ credits_remaining: credits.credits_remaining - 12 }).eq("user_id", user.id);
    return new Response(JSON.stringify({ analysis: aiData.choices[0].message.content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
