// Web Push sender — receives { user_ids, payload } and pushes via VAPID
// Authorization: caller must be authenticated and can only target themselves,
// unless they have the 'admin' role.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@uniqueapp.fun";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // AuthN: identify caller from JWT
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = userData.user.id;

    const { user_ids, payload } = await req.json();
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return new Response(JSON.stringify({ error: "user_ids required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // AuthZ: caller may target only self unless admin
    const targetsOthers = user_ids.some((id: string) => id !== callerId);
    if (targetsOthers) {
      const { data: isAdmin } = await admin.rpc("has_role", {
        _user_id: callerId,
        _role: "admin",
      });
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: "forbidden: can only push to self" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const { data: subs, error } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .in("user_id", user_ids);

    if (error) throw error;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = JSON.stringify(payload ?? {});
    const stale: string[] = [];
    let sent = 0;

    await Promise.all(
      subs.map(async (s: any) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            json,
            { TTL: 60, urgency: "high" },
          );
          sent++;
        } catch (e: any) {
          const code = e?.statusCode;
          if (code === 404 || code === 410) stale.push(s.id);
          console.error("push failed", code, e?.body || e?.message);
        }
      }),
    );

    if (stale.length) {
      await admin.from("push_subscriptions").delete().in("id", stale);
    }

    return new Response(JSON.stringify({ sent, removed: stale.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("send-push error", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
