import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { destination, recipientName, message, style } = await req.json();
    if (!destination || !recipientName || !message) throw new Error("All fields are required");

    const { data: credits } = await supabase.from("ai_credits").select("*").eq("user_id", user.id).single();
    if (!credits || credits.credits_remaining < 8) throw new Error("Insufficient credits. You need 8 credits.");

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a creative postcard writer. Write beautiful, evocative postcard text in a ${style} style. Include vivid descriptions of the destination. Keep it concise (100-200 words).`
          },
          {
            role: "user",
            content: `Write a ${style} postcard from ${destination} to ${recipientName}. The sender's personal message: "${message}". Create a beautiful postcard text that combines the destination's atmosphere with the personal message.`
          }
        ],
        temperature: 0.9,
      }),
    });

    const aiData = await openaiRes.json();
    const postcardText = aiData.choices[0].message.content;

    await supabase.from("virtual_postcards").insert({
      user_id: user.id,
      destination,
      message,
      recipient_name: recipientName,
      postcard_text: postcardText,
      style,
      credits_used: 8,
    });

    await supabase.from("ai_credits").update({
      credits_remaining: credits.credits_remaining - 8,
    }).eq("user_id", user.id);

    await supabase.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: "virtual_postcard",
      credits_used: 8,
      description: `Postcard from ${destination} to ${recipientName}`,
    });

    return new Response(JSON.stringify({ postcardText }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
