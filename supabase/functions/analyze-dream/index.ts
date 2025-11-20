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

    const { dreamContent } = await req.json();

    // Mock dream analysis - no AI API needed
    const analysisData = {
      analysis: "Váš sen obsahuje zaujímavé symboly a témy. Sny často odrážajú naše denné skúsenosti, emócie a podvedomé myšlienky. Tento konkrétny sen môže naznačovať váš aktuálny emocionálny stav a to, čo vás v živote zaujíma.",
      themes: [
        "Každodenné zážitky",
        "Emočné spracovanie",
        "Podvedomé myšlienky"
      ],
      emotions: [
        "Zvedavosť",
        "Sebaobjavovanie",
        "Vnútorný pokoj"
      ],
      symbols: [
        {
          symbol: "Hlavné symboly sna",
          meaning: "Symboly vo vašom sne môžu reprezentovať rôzne aspekty vášho života a vnútorného sveta. Každý symbol má osobný význam založený na vašich skúsenostiach."
        }
      ]
    };

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