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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { credits } = await req.json();
    
    if (!credits || typeof credits !== "number" || credits <= 0) {
      throw new Error("Invalid credits amount");
    }

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const { data } = await supabaseAuth.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    // Check if user has existing credits record
    const { data: existingCredits } = await supabaseClient
      .from("tutoring_credits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingCredits) {
      // Update existing record
      const { error } = await supabaseClient
        .from("tutoring_credits")
        .update({
          credits_remaining: existingCredits.credits_remaining + credits,
          total_credits_purchased: existingCredits.total_credits_purchased + credits,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;
    } else {
      // Create new record
      const { error } = await supabaseClient
        .from("tutoring_credits")
        .insert({
          user_id: user.id,
          credits_remaining: credits,
          total_credits_purchased: credits,
        });

      if (error) throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
