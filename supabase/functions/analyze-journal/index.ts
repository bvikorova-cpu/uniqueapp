import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
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

    const { journalContent, mood } = await req.json();

    // Mock journal analysis - English responses
    const moodEmotions: Record<string, string[]> = {
      happy: ["joy", "contentment", "optimism"],
      sad: ["self-awareness", "reflection", "growth"],
      anxious: ["awareness", "processing", "resilience"],
      calm: ["peace", "balance", "inner harmony"],
      energetic: ["energy", "motivation", "enthusiasm"]
    };

    const insightsData = {
      insights: `Your journal entry shows a ${mood || "thoughtful"} emotional state. Journaling is a great way to process your thoughts and emotions. Keep up this healthy habit.`,
      emotions: moodEmotions[mood as string] || ["self-discovery", "reflection", "growth"],
      suggestions: [
        "Continue journaling regularly",
        "Notice the positive moments in each day",
        "Be kind and patient with yourself",
        "Make time for activities that fulfill you"
      ],
      affirmations: [
        "You are on the right path. Your thoughts and feelings matter.",
        "You deserve love and understanding."
      ]
    };

    return new Response(
      JSON.stringify(insightsData),
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