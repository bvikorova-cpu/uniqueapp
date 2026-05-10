import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const code = (url.searchParams.get("code") || "").trim().slice(0, 64);
    if (!code) {
      return new Response(JSON.stringify({ error: "code required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ua = (req.headers.get("user-agent") || "").slice(0, 500);
    const country = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || null;
    const referrer = (req.headers.get("referer") || "").slice(0, 500);

    const ipHash = await sha256(ip + "|" + (Deno.env.get("SUPABASE_URL") ?? ""));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("referral_link_clicks").insert({
      code,
      ip_hash: ipHash,
      user_agent: ua,
      country,
      referrer_url: referrer,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
