import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { characterIds } = await req.json();
    if (!characterIds?.length) throw new Error("No characters provided");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: characters } = await supabase
      .from("ai_characters")
      .select("*")
      .in("id", characterIds);

    // Simulate battle royale
    const rounds = [];
    let remaining = [...(characters || characterIds.map((id: string, i: number) => ({ id, name: `Fighter ${i+1}`, personality_type: "warrior" })))];
    
    while (remaining.length > 1) {
      const idx = Math.floor(Math.random() * remaining.length);
      const eliminated = remaining.splice(idx, 1)[0];
      rounds.push({ eliminated: eliminated.name || eliminated.id, remainingCount: remaining.length });
    }

    const winner = remaining[0];

    return new Response(JSON.stringify({
      winner: { id: winner.id, name: winner.name || "Champion" },
      rounds,
      totalFighters: characterIds.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
