// Public report verification — register a report verification token + look it up by token
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (req.method === "GET" && token) {
      const { data: v } = await supabase.from("lie_report_verifications")
        .select("token,title,summary,truthfulness_score,generated_at,view_count")
        .eq("token", token).maybeSingle();
      if (!v) return json({ valid: false }, 404);
      await supabase.from("lie_report_verifications").update({ view_count: (v.view_count ?? 0) + 1 }).eq("token", token);
      return json({ valid: true, ...v });
    }

    // POST register
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supaAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: { user } } = await supaAuth.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { report_id, title, summary, truthfulness_score } = await req.json();
    const newToken = crypto.randomUUID().replace(/-/g, "").slice(0, 14).toUpperCase();
    const { data: saved, error } = await supabase.from("lie_report_verifications").insert({
      report_id: report_id ?? null, user_id: user.id, token: newToken,
      title: title ?? null, summary: summary ?? null, truthfulness_score: truthfulness_score ?? null,
    }).select().single();
    if (error) return json({ error: error.message }, 400);
    return json({ token: newToken, verification: saved });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
function json(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
