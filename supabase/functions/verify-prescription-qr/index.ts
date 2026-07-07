// Public endpoint pharmacies use to verify a prescription QR token.
// Returns only non-PII fields.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token")?.trim();
    if (!token) return json({ error: "missing_token" }, 400);
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data } = await admin
      .from("prescriptions")
      .select("issued_at, medications, dosage_instructions, expires_at")
      .eq("qr_token", token)
      .maybeSingle();
    if (!data) return json({ valid: false }, 404);
    const expired = new Date(data.expires_at).getTime() < Date.now();
    return json({ valid: !expired, ...data });
  } catch (e) {
    console.error("verify-prescription-qr", e);
    return json({ error: "internal" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
