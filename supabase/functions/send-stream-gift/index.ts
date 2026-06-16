// Send gift in live stream – wrapper for shared one-off router
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

    const { streamId, giftId, message } = await req.json();
    if (!streamId || !giftId) throw new Error("Missing required fields");

    const { data: gift, error: giftErr } = await supabase
      .from("platform_gifts")
      .select("*")
      .eq("id", giftId)
      .single();
    if (giftErr || !gift) throw new Error("Gift not found");

    const { data: stream, error: streamErr } = await supabase
      .from("live_streams")
      .select("influencer_id")
      .eq("id", streamId)
      .single();
    if (streamErr || !stream) throw new Error("Stream not found");

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const { url, sessionId } = await createOneOffSession({
      productKey: "stream_gift",
      amount: Math.round(Number(gift.price) * 100),
      name: `${gift.icon} ${gift.name}`,
      description: message || "Virtual gift for the streamer",
      userId: user.id,
      userEmail: user.email,
      origin,
      successPath: `/live-stream/${streamId}?success=true&type=gift`,
      cancelPath: `/live-stream/${streamId}?canceled=true`,
      metadata: {
        sender_id: user.id,
        stream_id: streamId,
        influencer_id: stream.influencer_id,
        gift_id: giftId,
        message: message || "",
        type: "stream_gift",
      },
    });

    // Pre-record so verify can finalize it
    await supabase.from("stream_gifts").insert({
      sender_id: user.id,
      stream_id: streamId,
      gift_id: giftId,
      message: message || null,
      amount: gift.price,
      status: "pending",
      stripe_session_id: sessionId,
    }).then((res) => {
      if (res.error) console.error("stream_gifts insert failed:", res.error.message);
    });

    return new Response(JSON.stringify({ url, session_id: sessionId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Stream gift payment error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    const status = /not authenticated|unauthorized/i.test(msg) ? 401
      : /missing|not found|already have|unsupported|required/i.test(msg) ? 400
      : 500;
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status,
    });
  }
});
