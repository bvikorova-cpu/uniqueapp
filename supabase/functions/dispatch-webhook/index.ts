import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import webpush from "npm:web-push@3.6.7";

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

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY");
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@uniqueapp.fun";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

async function ensureInAppFallback(admin: ReturnType<typeof createClient>, userIds: string[], payload: Record<string, any>) {
  const type = String(payload?.type ?? "push_fallback");
  const title = String(payload?.title ?? "Notification");
  const message = String(payload?.body ?? "");
  const action_url = payload?.url ? String(payload.url) : null;
  const related_id = payload?.related_id ? String(payload.related_id) : null;
  let inserted = 0;
  for (const uid of userIds) {
    try {
      // Dedupe: skip if a matching notification already exists in the last 5 minutes
      let q = admin.from("notifications").select("id", { head: true, count: "exact" })
        .eq("user_id", uid).eq("type", type)
        .gte("created_at", new Date(Date.now() - 5 * 60_000).toISOString());
      if (related_id) q = q.eq("related_id", related_id);
      const { count } = await q;
      if ((count ?? 0) > 0) continue;
      const { error } = await admin.from("notifications").insert({
        user_id: uid, type, title, message, action_url, related_id, is_read: false,
      });
      if (!error) inserted += 1;
      else console.error("fallback notification insert failed", error.message);
    } catch (e) { console.error("fallback err", (e as Error).message); }
  }
  return { inserted };
}

async function sendPushNotifications(admin: ReturnType<typeof createClient>, userIds: string[], payload: Record<string, unknown>) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) throw new Error("Missing VAPID configuration");

  const logRow = async (row: Record<string, unknown>) => {
    try { await admin.from("push_notification_logs").insert(row); }
    catch (e) { console.error("push log insert failed", (e as Error).message); }
  };

  const { data: subs, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("user_id", userIds);

  if (error) {
    await logRow({ user_ids: userIds, payload, status: "failed", sent_count: 0, removed_count: 0, error: error.message, source: "dispatch-webhook" });
    throw error;
  }
  if (!subs?.length) {
    await logRow({ user_ids: userIds, payload, status: "no_subscriptions", sent_count: 0, removed_count: 0, source: "dispatch-webhook" });
    const fallback = await ensureInAppFallback(admin, userIds, payload);
    return { sent: 0, removed: 0, in_app_fallback: fallback };
  }

  const stale: string[] = [];
  const errors: string[] = [];
  let sent = 0;
  const body = JSON.stringify(payload ?? {});

  await Promise.all(subs.map(async (sub: any) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        body,
        { TTL: 60, urgency: "high" },
      );
      sent += 1;
    } catch (e: any) {
      if (e?.statusCode === 404 || e?.statusCode === 410) stale.push(sub.id);
      const msg = `${e?.statusCode ?? ""} ${e?.body || e?.message || "unknown"}`.trim();
      errors.push(msg);
      console.error("push failed", e?.statusCode, e?.body || e?.message);
    }
  }));

  if (stale.length) await admin.from("push_subscriptions").delete().in("id", stale);

  await logRow({
    user_ids: userIds,
    payload,
    status: sent > 0 ? "sent" : "failed",
    sent_count: sent,
    removed_count: stale.length,
    error: errors.length ? errors.join(" | ").slice(0, 1000) : null,
    source: "dispatch-webhook",
  });

  return { sent, removed: stale.length };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (Array.isArray(body?.user_ids) && body?.payload) {
      const result = await sendPushNotifications(admin, body.user_ids, body.payload);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const webhookBody = body as Body;
    if (!webhookBody?.user_id || !webhookBody?.event_type) {
      return new Response(JSON.stringify({ error: "Missing user_id or event_type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: hooks } = await admin
      .from("creator_webhooks")
      .select("id,url,secret,events")
      .eq("user_id", webhookBody.user_id)
      .eq("is_active", true);

    const matching = (hooks ?? []).filter((h: any) => h.events.includes(webhookBody.event_type));
    const results: any[] = [];

    for (const hook of matching) {
      const payloadStr = JSON.stringify({
        event: webhookBody.event_type,
        ts: Date.now(),
        data: webhookBody.payload,
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
            "X-Webhook-Event": webhookBody.event_type,
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
        event_type: webhookBody.event_type,
        payload: webhookBody.payload,
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
