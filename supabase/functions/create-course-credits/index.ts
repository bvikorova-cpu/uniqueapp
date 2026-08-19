import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COST = 15;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabase.auth.getUser(token);
    const user = data.user;
    if (!user?.id) throw new Error("User not authenticated");

    const { course, lessons, publish } = await req.json();

    if (!course?.title?.trim() || !course?.description?.trim()) {
      throw new Error("Course title and description are required");
    }
    if (!Array.isArray(lessons) || lessons.length === 0) {
      throw new Error("At least one module is required");
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: creditsRow } = await admin
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const available = creditsRow?.credits_remaining ?? 0;

    if (available < COST) {
      return new Response(
        JSON.stringify({
          error: `Insufficient credits. Publishing a course costs ${COST} credits.`,
          credits_remaining: available,
          cost: COST,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 },
      );
    }

    const { error: deductErr } = await admin.rpc("deduct_ai_credits", {
      p_user_id: user.id,
      p_amount: COST,
      p_reason: "Publish course",
      p_source: "create-course-credits",
    });
    if (deductErr) {
      throw new Error(`Credit deduction failed: ${deductErr.message}`);
    }

    let refunded = false;
    const refund = async () => {
      if (refunded) return;
      refunded = true;
      try {
        await admin.rpc("add_ai_credits", {
          p_user_id: user.id,
          p_amount: COST,
          p_reason: "Refund: course creation failed",
          p_source: "create-course-credits",
        });
      } catch {
        // best-effort refund
      }
    };

    const { data: inserted, error: courseErr } = await admin
      .from("courses")
      .insert({
        creator_id: user.id,
        title: course.title.trim(),
        description: course.description.trim(),
        category: course.category?.trim() || "General",
        difficulty_level: course.difficulty_level || "beginner",
        price: Number(course.price) || 0,
        duration_minutes: Number(course.duration_minutes) || 0,
        total_lessons: Number(course.total_lessons) || lessons.length,
        thumbnail_url: course.thumbnail_url || null,
        is_published: !!publish,
      })
      .select()
      .single();

    if (courseErr || !inserted) {
      await refund();
      throw new Error(courseErr?.message || "Failed to create course");
    }

    const lessonRows = lessons.map((m: any, i: number) => ({
      course_id: inserted.id,
      title: m.title?.trim() || `Module ${i + 1}`,
      description: m.description?.trim() || null,
      video_url: m.video_url || null,
      content: m.content?.trim() || null,
      attachment_url: m.attachment_url || null,
      attachment_name: m.attachment_name || null,
      duration_minutes: Number(m.duration_minutes) || 10,
      order_index: i,
      is_preview: i === 0,
    }));

    const { error: lessonsErr } = await admin
      .from("course_lessons")
      .insert(lessonRows);

    if (lessonsErr) {
      await admin.from("courses").delete().eq("id", inserted.id);
      await refund();
      throw new Error(lessonsErr.message);
    }

    await admin.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: "create_course",
      credits_used: COST,
      description: `Published course: ${course.title.trim()}`,
    });

    const remaining = available - COST;
    return new Response(
      JSON.stringify({ courseId: inserted.id, credits_remaining: remaining }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
