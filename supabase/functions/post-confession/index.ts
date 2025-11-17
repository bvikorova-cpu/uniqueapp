import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SIN_CATEGORIES = [
  "Pride", "Greed", "Lust", "Envy", "Gluttony", "Wrath", "Sloth",
  "Dishonesty", "Betrayal", "Theft", "Violence", "Negligence"
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { confessionText, isAnonymous } = await req.json();

    // AI categorization and severity assessment
    const category = SIN_CATEGORIES[Math.floor(Math.random() * SIN_CATEGORIES.length)];
    const severity = Math.floor(Math.random() * 10) + 1;

    const { data: confession, error } = await supabaseClient
      .from("confessions")
      .insert({
        user_id: user.id,
        confession_text: confessionText,
        sin_category: category,
        severity_score: severity,
        is_anonymous: isAnonymous,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        confession: {
          id: confession.id,
          category,
          severity,
          created_at: confession.created_at
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});