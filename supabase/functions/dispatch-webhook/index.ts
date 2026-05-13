import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hmac(secret: string, body: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface Body {
  user_id: string;
  event_type: string;
  payload: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    if (!body?.user_id || !body?.event_type) {
      return new Response(JSON.stringify({ error: "Missing user_id or event_type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: hooks } = await admin
      .from("creator_webhooks")
      .select("id,url,secret,events")
      .eq("user_id", body.user_id)
      .eq("is_active", true);

    const matching = (hooks ?? []).filter((h: any) => h.events.includes(body.event_type));
    const results: any[] = [];

    for (const hook of matching) {
      const payloadStr = JSON.stringify({
        event: body.event_type,
        ts: Date.now(),
        data: body.payload,
      });
      const signature = await hmac(hook.secret, payloadStr);
      let status = 0;
      let respText = "";
      try {
        const r = await fetch(hook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
            "X-Webhook-Event": body.event_type,
          },
          body: payloadStr,
          signal: AbortSignal.timeout(8000),
        });
        status = r.status;
        respText = (await r.text()).slice(0, 500);
      } catch (e) {
        respText = (e as Error).message.slice(0, 500);
      }

      await admin.from("webhook_deliveries").insert({
        webhook_id: hook.id,
        event_type: body.event_type,
        payload: body.payload,
        status_code: status,
        response_body: respText,
        delivered_at: new Date().toISOString(),
      });

      results.push({ webhook_id: hook.id, status });
    }

    return new Response(JSON.stringify({ dispatched: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
