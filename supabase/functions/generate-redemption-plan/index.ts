import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  try {
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's confessions
    const { data: confessions } = await supabaseClient
      .from("confessions")
      .select("*")
      .eq("user_id", user.id);

    const totalSeverity = confessions?.reduce((sum, c) => sum + (c.severity_score || 0), 0) || 0;
    const avgSeverity = confessions && confessions.length > 0 ? totalSeverity / confessions.length : 5;

    const plan = {
      user_id: user.id,
      redemption_plan: {
        phase_1: {
          title: "Self-Reflection",
          duration: "2 weeks",
          tasks: [
            "Daily meditation (15 minutes)",
            "Journal about past actions",
            "Identify patterns in behavior",
          ],
        },
        phase_2: {
          title: "Active Redemption",
          duration: "4 weeks",
          tasks: [
            "Volunteer in community service",
            "Make amends with affected parties",
            "Practice acts of kindness daily",
          ],
        },
        phase_3: {
          title: "Sustained Growth",
          duration: "6 weeks",
          tasks: [
            "Mentor others seeking redemption",
            "Establish positive habits",
            "Document progress and insights",
          ],
        },
      },
      total_milestones: 12,
      milestones_completed: 0,
      progress_percentage: 0,
      counseling_sessions: {
        sessions: [
          {
            week: 1,
            topic: "Understanding Your Actions",
            focus: "Explore root causes of behaviors",
          },
          {
            week: 4,
            topic: "Building Empathy",
            focus: "Understand impact on others",
          },
          {
            week: 8,
            topic: "Creating Lasting Change",
            focus: "Develop sustainable positive habits",
          },
        ],
      },
    };

    const { data: redemption, error } = await supabaseClient
      .from("redemption_progress")
      .insert(plan)
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, redemption }),
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