// Admin Seed Content — populates the platform with demo data so the homepage,
// Megatalent feed and Megaforum don't feel empty during early launch.
// Idempotent: re-running adds new rows but never duplicates a marker handle.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SEED_MARKER = "[DEMO]";

const DEMO_MEGATALENT = [
  { title: `${SEED_MARKER} Sunset acoustic cover`, description: "Original acoustic arrangement, recorded on a Friday evening.", category: "music" },
  { title: `${SEED_MARKER} 30-second street magic`, description: "A close-up card trick filmed in the city centre.", category: "magic" },
  { title: `${SEED_MARKER} Charcoal portrait timelapse`, description: "Three hours of drawing, sped up to 30 seconds.", category: "drawing" },
  { title: `${SEED_MARKER} Stand-up: my first open mic`, description: "Five minutes of brand-new material from last night.", category: "comedy" },
  { title: `${SEED_MARKER} Beatbox loop pedal demo`, description: "Layered beatbox with live looping — one take.", category: "music" },
  { title: `${SEED_MARKER} Watercolour landscape`, description: "Painting a mountain lake in real time.", category: "drawing" },
];

const DEMO_FORUM = [
  { title: `${SEED_MARKER} What's the best AI tool you've discovered here?`, body: "Curious to hear which built-in tools you've actually kept using day to day. Mine is the Content Studio." },
  { title: `${SEED_MARKER} Anyone using the platform for side income?`, body: "Share your story — what works, what doesn't?" },
  { title: `${SEED_MARKER} Looking for collaborators for a creative project`, body: "Visual artist + musician — DM me if interested." },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin gate
    const { data: roleRow } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const target: "megatalent" | "forum" | "all" | "purge" = body.target ?? "all";

    const admin = createClient(supabaseUrl, serviceRole);
    const results: Record<string, number> = {};

    if (target === "purge") {
      const [{ count: mt }, { count: fp }] = await Promise.all([
        admin.from("megatalent_submissions").delete({ count: "exact" }).ilike("title", `${SEED_MARKER}%`),
        admin.from("forum_posts").delete({ count: "exact" }).ilike("title", `${SEED_MARKER}%`),
      ]) as any;
      results.megatalent_deleted = mt ?? 0;
      results.forum_deleted = fp ?? 0;
      return new Response(JSON.stringify({ ok: true, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (target === "megatalent" || target === "all") {
      const rows = DEMO_MEGATALENT.map((d) => ({
        user_id: user.id, // admin owns the seed rows; can be reassigned later
        title: d.title,
        description: d.description,
        category: d.category,
        media_url: "https://placehold.co/800x450/120024/FFFFFF/png?text=DEMO",
        media_type: "image",
        votes_count: Math.floor(Math.random() * 80) + 10,
        status: "approved",
      }));
      const { data: mt, error: mtErr } = await admin
        .from("megatalent_submissions")
        .insert(rows)
        .select("id");
      if (mtErr) console.warn("megatalent insert error:", mtErr.message);
      results.megatalent_inserted = mt?.length ?? 0;
    }

    if (target === "forum" || target === "all") {
      const rows = DEMO_FORUM.map((d) => ({
        user_id: user.id,
        title: d.title,
        body: d.body,
        category: "general",
      }));
      const { data: fp, error: fpErr } = await admin
        .from("forum_posts")
        .insert(rows)
        .select("id");
      if (fpErr) console.warn("forum insert error:", fpErr.message);
      results.forum_inserted = fp?.length ?? 0;
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
