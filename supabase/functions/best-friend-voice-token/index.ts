// Issues a short-lived ElevenLabs Conversational AI token tied to the user's persona.
// Requires ELEVENLABS_API_KEY and BEST_FRIEND_AGENT_ID secrets.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return j({ error: "Unauthorized" }, 401);

    const ELEVEN = Deno.env.get("ELEVENLABS_API_KEY");
    const AGENT = Deno.env.get("BEST_FRIEND_AGENT_ID");
    if (!ELEVEN || !AGENT) return j({ error: "Voice not configured. Add ELEVENLABS_API_KEY and BEST_FRIEND_AGENT_ID." }, 500);

    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
    const { data: u } = await anon.auth.getUser();
    if (!u.user) return j({ error: "Unauthorized" }, 401);

    // Subscription check — voice is premium
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } });
    const { data: sub } = await admin.from("best_friend_subscriptions")
      .select("subscription_status").eq("user_id", u.user.id).maybeSingle();
    if (sub?.subscription_status !== "active") {
      return j({ error: "voice_requires_subscription" }, 402);
    }

    const resp = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${AGENT}`,
      { headers: { "xi-api-key": ELEVEN } },
    );
    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      console.error("eleven token err", resp.status, t);
      return j({ error: "voice service error" }, 502);
    }
    const { token } = await resp.json();
    return j({ token, agent_id: AGENT });
  } catch (e) {
    return j({ error: String(e) }, 500);
  }
});
function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
