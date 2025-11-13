import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("Unauthorized");

    // Get or create usage record
    let { data: usage, error } = await supabaseClient
      .from("teen_career_counselor_usage")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code === "PGRST116") {
      // Record doesn't exist, create it
      const { data: newUsage, error: insertError } = await supabaseClient
        .from("teen_career_counselor_usage")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (insertError) throw insertError;
      usage = newUsage;
    } else if (error) {
      throw error;
    }

    const hasFreeTrial = usage.free_generations_used < 1;
    const canGenerate = hasFreeTrial || usage.paid_generations > 0;

    return new Response(
      JSON.stringify({
        canGenerate,
        hasFreeTrial,
        freeGenerationsUsed: usage.free_generations_used,
        paidGenerations: usage.paid_generations,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
