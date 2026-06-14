// One-shot admin: flips listed storage buckets to private via Storage Admin API.
// Auth: requires x-admin-secret header matching ADMIN_USER_ID env (verify_jwt=false).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
};

const BUCKETS = [
  "video-resumes",
  "voice-memories",
  "anonymous-date-voice",
  "voice-intros",
  "handwriting-capsule",
  "handwriting-gallery",
  "old-photos",
  "future-face-photos",
  "ancestor-twin-photos",
  "messenger-attachments",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminSecret = Deno.env.get("ADMIN_USER_ID") ?? "";

    const provided = req.headers.get("x-admin-secret") ?? "";
    if (!adminSecret || provided !== adminSecret) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(url, serviceKey);
    const results: Record<string, unknown> = {};
    for (const id of BUCKETS) {
      const { data, error } = await admin.storage.updateBucket(id, { public: false });
      results[id] = error ? { error: error.message } : { ok: true, data };
    }
    return new Response(JSON.stringify({ results }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
