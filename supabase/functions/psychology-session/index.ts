// Edge function: psychology-session
// Server-side gateway for the anonymous psychology chat.
// Validates session_token before any read/write to psychology_sessions / psychology_messages.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// UUID v4 / generic UUID validator
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { action, session_token, role, content } = body ?? {};

  if (!action || typeof action !== "string") {
    return json({ error: "Missing 'action'" }, 400);
  }
  if (!session_token || typeof session_token !== "string" || !UUID_RE.test(session_token)) {
    return json({ error: "Invalid 'session_token'" }, 400);
  }

  const supa = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    if (action === "init") {
      // Find or create session for this token
      const { data: existing } = await supa
        .from("psychology_sessions")
        .select("id")
        .eq("session_token", session_token)
        .maybeSingle();

      if (existing) return json({ id: existing.id, created: false });

      const { data: created, error } = await supa
        .from("psychology_sessions")
        .insert({ session_token })
        .select("id")
        .single();

      if (error) return json({ error: error.message }, 500);
      return json({ id: created.id, created: true });
    }

    if (action === "messages") {
      // Validate token owns the session, then return messages
      const { data: sess } = await supa
        .from("psychology_sessions")
        .select("id")
        .eq("session_token", session_token)
        .maybeSingle();
      if (!sess) return json({ error: "Session not found" }, 404);

      const { data: msgs, error } = await supa
        .from("psychology_messages")
        .select("id, role, content, created_at")
        .eq("session_id", sess.id)
        .order("created_at", { ascending: true });

      if (error) return json({ error: error.message }, 500);
      return json({ messages: msgs ?? [] });
    }

    if (action === "insert-message") {
      if (role !== "user" && role !== "assistant") {
        return json({ error: "Invalid role" }, 400);
      }
      if (typeof content !== "string" || content.length === 0 || content.length > 10000) {
        return json({ error: "Invalid content" }, 400);
      }

      const { data: sess } = await supa
        .from("psychology_sessions")
        .select("id")
        .eq("session_token", session_token)
        .maybeSingle();
      if (!sess) return json({ error: "Session not found" }, 404);

      const { error } = await supa.from("psychology_messages").insert({
        session_id: sess.id,
        role,
        content,
      });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("psychology-session error:", e);
    return json({ error: "Internal server error" }, 500);
  }
});
