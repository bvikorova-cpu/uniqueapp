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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { dreamId, dreamText } = await req.json();
    if (!dreamText || !dreamId) throw new Error("Dream text and ID are required");

    // Check credits
    const { data: credits } = await supabase.from("ai_credits").select("*").eq("user_id", user.id).single();
    if (!credits || credits.credits_remaining < 5) {
      throw new Error("Insufficient credits. You need 5 credits for dream analysis.");
    }

    // Call OpenAI
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OpenAI API key not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a dream interpretation psychologist. Analyze dreams using Jungian and Freudian frameworks, plus modern cognitive psychology. Provide:
1. **Symbolic Analysis** — Key symbols and their psychological meanings
2. **Emotional Themes** — Underlying emotional patterns
3. **Possible Meanings** — 2-3 interpretations of what the dream might represent
4. **Connection to Waking Life** — How this might relate to current life situations
5. **Reflection Questions** — 2-3 questions for deeper self-exploration

Be empathetic, insightful, and avoid being overly clinical. Use markdown formatting.`
          },
          { role: "user", content: `Please analyze this dream:\n\n${dreamText}` },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const aiData = await response.json();
    const analysis = aiData.choices?.[0]?.message?.content || "Unable to generate analysis.";

    // Deduct credits
    await supabase.from("ai_credits").update({
      credits_remaining: credits.credits_remaining - 5,
    }).eq("user_id", user.id);

    // Save interpretation
    await supabase.from("psychology_dream_entries" as any).update({
      ai_interpretation: analysis,
    }).eq("id", dreamId).eq("user_id", user.id);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
