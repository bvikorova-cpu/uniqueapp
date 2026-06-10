// Concert song-request / collectible-ticket – wrapper for shared one-off router
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { createOneOffSession } from "../_shared/oneOffCheckout.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data, error: authErr } = await supabase.auth.getUser(token);
    const user = data.user;
    if (authErr || !user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }

    const { type, amount, metadata = {} } = await req.json();
    if (!type || !amount) throw new Error("Missing type or amount");

    const productKey =
      type === "song_request"
        ? "concert_song_request"
        : type === "collectible_ticket"
        ? "concert_collectible_ticket"
        : null;
    if (!productKey) throw new Error(`Unsupported concert type: ${type}`);

    const name =
      type === "song_request"
        ? `Song Request (${metadata?.tier || "standard"}) — ${metadata?.song || ""}`
        : `Collectible Ticket — ${metadata?.artist || ""} ${metadata?.edition || ""} Edition`;

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const { url } = await createOneOffSession({
      productKey,
      amount,
      name,
      userId: user.id,
      userEmail: user.email,
      origin,
      successPath: `/live-concerts?purchase=success&type=${type}`,
      cancelPath: `/live-concerts?purchase=canceled`,
      metadata: { user_id: user.id, type, ...metadata },
    });

    return new Response(JSON.stringify({ url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const status = /not authenticated|unauthorized/i.test(msg) ? 401
      : /missing|not found|already have|unsupported|required/i.test(msg) ? 400
      : 500;
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status,
    });
  }
});
