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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user) throw new Error("Unauthorized");

    const { days = 30 } = await req.json();

    // Get mood logs from the last N days
    const { data: moodLogs, error } = await supabaseClient
      .from("mood_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order("log_date", { ascending: true });

    if (error) throw error;

    // Get journal entries for emotional trends
    const { data: journals } = await supabaseClient
      .from("journal_entries")
      .select("mood, emotions_detected, entry_date")
      .eq("user_id", user.id)
      .gte("entry_date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order("entry_date", { ascending: true });

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
            content: `You are a mental health trend analyst. Analyze mood and energy patterns to provide:
- Overall mental health trend (improving/stable/concerning)
- Patterns in mood fluctuations
- Energy and stress level insights
- Recommendations for well-being
- Warning signs if any

Respond with a JSON object containing:
{
  "trend": "improving/stable/concerning",
  "summary": "overall analysis",
  "patterns": ["pattern1", "pattern2"],
  "recommendations": ["rec1", "rec2"],
  "warnings": ["warning1"] or []
}`
          },
          {
            role: "user",
            content: `Analyze these mood logs from the last ${days} days:\n${JSON.stringify(moodLogs)}\n\nJournal moods:\n${JSON.stringify(journals)}`
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate trends");
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) throw new Error("No trends generated");

    const trendsData = JSON.parse(result);

    return new Response(
      JSON.stringify({ ...trendsData, moodLogs }),
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