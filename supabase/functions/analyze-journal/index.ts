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

    // Mock journal analysis - no AI API needed
    const moodEmotions: Record<string, string[]> = {
      happy: ["radosť", "spokojnosť", "optimizmus"],
      sad: ["smútok", "zamyslenie", "spracovanie"],
      anxious: ["napätie", "obavy", "potreba upokojenia"],
      calm: ["pokoj", "vyrovnanosť", "vnútorná harmónia"],
      energetic: ["energia", "motivácia", "nadšenie"]
    };

    const insightsData = {
      insights: `Váš denníkový záznam ukazuje ${mood || "zaujímavý"} emočný stav. Písanie denníka je skvelý spôsob, ako spracovať svoje myšlienky a emócie. Pokračujte v tejto zdravej zvyklosti.`,
      emotions: moodEmotions[mood as string] || ["sebapoznanie", "reflexia", "rast"],
      suggestions: [
        "Pokračujte v pravidelnom písaní denníka",
        "Všímajte si pozitívne momenty v každom dni",
        "Buďte k sebe láskavý a trpezlivý",
        "Venujte si čas na aktivity, ktoré vás napĺňajú"
      ],
      affirmations: [
        "Ste na dobrej ceste. Vaše myšlienky a pocity sú dôležité.",
        "Zaslúžite si lásku a porozumenie."
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