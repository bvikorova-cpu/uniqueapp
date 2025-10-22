import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use ANON KEY - RLS policies will enforce access control
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user) throw new Error("Unauthorized");

    const { dreamContent } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert dream analyst. Analyze dreams and provide insights about:
- Main themes and symbols
- Emotional undertones
- Possible subconscious meanings
- Recurring patterns
- Connections to waking life

Respond with a JSON object containing:
{
  "analysis": "detailed analysis text",
  "themes": ["theme1", "theme2"],
  "emotions": ["emotion1", "emotion2"],
  "symbols": [{"symbol": "name", "meaning": "interpretation"}]
}`
          },
          {
            role: "user",
            content: dreamContent
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate analysis");
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) throw new Error("No analysis generated");

    // Parse the JSON response
    const analysisData = JSON.parse(result);

    return new Response(
      JSON.stringify(analysisData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});