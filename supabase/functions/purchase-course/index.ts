// Course purchase – wrapper for shared one-off router
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { createOneOffSession } from "../_shared/oneOffCheckout.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabase.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { courseId } = await req.json();

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();
    if (courseError || !course) throw new Error("Course not found");

    const { data: existing } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("course_id", courseId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) throw new Error("Already enrolled in this course");

    // Revenue split: 70% instructor / 30% platform
    const total = Number(course.price);
    const instructorAmount = total * 0.7;
    const platformFee = total * 0.3;

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const { url, sessionId } = await createOneOffSession({
      productKey: "course_purchase",
      amount: Math.round(total * 100),
      name: course.title,
      description: `Lifetime access to ${course.title}`,
      userId: user.id,
      userEmail: user.email,
      origin,
      successPath: `/course/${courseId}?enrolled=true`,
      cancelPath: `/course/${courseId}`,
      metadata: {
        type: "course_purchase",
        courseId,
        userId: user.id,
        instructorAmount: instructorAmount.toFixed(2),
        platformFee: platformFee.toFixed(2),
      },
    });

    return new Response(JSON.stringify({ url, sessionId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
