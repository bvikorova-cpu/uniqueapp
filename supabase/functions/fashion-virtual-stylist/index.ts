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
    if (!credits || credits.credits_remaining < 15) throw new Error("Insufficient credits (need 15)");

    const { imageUrl, preferences } = await req.json();
    const messages: any[] = [
      { role: "system", content: "You are a world-class virtual fashion stylist conducting a premium styling session. Provide: 1) Current Style Assessment, 2) Body-type styling tips, 3) Seasonal wardrobe plan (Spring/Summer/Fall/Winter), 4) 5 complete outfit formulas for different occasions, 5) Color palette recommendation, 6) Must-have investment pieces, 7) Shopping priority list, 8) Style evolution roadmap. Be detailed and personal. Use markdown." }
    ];
    if (imageUrl) {
      messages.push({ role: "user", content: [{ type: "text", text: `Styling session preferences: ${preferences}` }, { type: "image_url", image_url: { url: imageUrl } }] });
    } else {
      messages.push({ role: "user", content: `Styling session preferences: ${preferences}` });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: 3000 })
    });
    const aiData = await response.json();
    await supabase.from("ai_credits").update({ credits_remaining: credits.credits_remaining - 15 }).eq("user_id", user.id);
    return new Response(JSON.stringify({ analysis: aiData.choices[0].message.content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
