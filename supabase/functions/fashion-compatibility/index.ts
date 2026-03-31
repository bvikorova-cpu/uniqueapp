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
    if (!credits || credits.credits_remaining < 8) throw new Error("Insufficient credits (need 8)");

    const { outfit1, outfit2 } = await req.json();
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a fashion compatibility analyst. Compare two styles/outfits and provide: 1) Compatibility score (0-100%), 2) Style harmony analysis, 3) Color compatibility, 4) Occasion overlap, 5) How to blend both styles, 6) Hybrid outfit suggestions combining elements. Use markdown." },
          { role: "user", content: `Analyze compatibility between:\n\nStyle 1: ${outfit1}\n\nStyle 2: ${outfit2}` }
        ], max_tokens: 2000
      })
    });
    const aiData = await response.json();
    await supabase.from("ai_credits").update({ credits_remaining: credits.credits_remaining - 8 }).eq("user_id", user.id);
    return new Response(JSON.stringify({ analysis: aiData.choices[0].message.content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
