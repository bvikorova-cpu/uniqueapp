// API Keys management — issue/revoke API keys for external investigators
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { action, label, key_id } = await req.json();

    if (action === "create") {
      if (!label) return json({ error: "label required" }, 400);
      const raw = `lie_${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
      const enc = new TextEncoder().encode(raw);
      const hashBuf = await crypto.subtle.digest("SHA-256", enc);
      const key_hash = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
      const key_prefix = raw.slice(0, 12);
      await supabase.from("lie_api_keys").insert({ user_id: user.id, label, key_prefix, key_hash });
      return json({ api_key: raw, key_prefix, warning: "Save this key now — it cannot be shown again." });
    }
    if (action === "revoke") {
      if (!key_id) return json({ error: "key_id required" }, 400);
      await supabase.from("lie_api_keys").update({ is_active: false }).eq("id", key_id).eq("user_id", user.id);
      return json({ revoked: true });
    }
    return json({ error: "unknown action" }, 400);
  } catch (e) { return json({ error: e instanceof Error ? e.message : "Unknown" }, 500); }
});
function json(b: any, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
