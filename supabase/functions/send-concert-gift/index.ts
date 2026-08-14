// Send a paid virtual gift during a live concert.
// Uses shared one-off Stripe checkout. Pre-records pending row in sent_platform_gifts.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { createOneOffSession } from "../_shared/oneOffCheckout.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

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
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data, error: authErr } = await supabase.auth.getUser(token);
    const user = data.user;
    if (authErr || !user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 });
    }

    const body = await req.json();
    const { giftId, message } = body;
    const isComedy = body.context === "comedy" || !!body.showId;
    const contextId = isComedy ? body.showId : body.concertId;
    if (!contextId || !giftId) throw new Error("Missing required fields");

    // Service-role client: concert rows are protected by RLS (stream keys), so a
    // user-scoped read returns nothing even for a valid concert.
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: gift, error: giftErr } = await supabase
      .from("platform_gifts").select("*").eq("id", giftId).single();
    if (giftErr || !gift) throw new Error("Gift not found");

    let receiverId: string | undefined;
    if (isComedy) {
      const { data: show, error: sErr } = await admin
        .from("comedy_shows")
        .select("id, comedian_id, title, comedian_profiles!inner(user_id)")
        .eq("id", contextId).single();
      if (sErr || !show) throw new Error("Show not found");
      receiverId = (show as any).comedian_profiles?.user_id;
      if (!receiverId) throw new Error("Comedian profile not linked to a user");
    } else {
      const { data: concert, error: cErr } = await admin
        .from("live_concert_streams")
        .select("id, musician_id, status, musician_profiles!inner(user_id)")
        .eq("id", contextId).single();
      if (cErr || !concert) throw new Error("Concert not found");
      receiverId = (concert as any).musician_profiles?.user_id;
      if (!receiverId) throw new Error("Musician profile not linked to a user");
    }

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const { url, sessionId } = await createOneOffSession({
      productKey: "stream_gift",
      amount: Math.round(Number(gift.price) * 100),
      name: `${gift.icon} ${gift.name}`,
      description: message || (isComedy ? "Virtual gift for the comedian" : "Virtual gift for the artist"),
      userId: user.id,
      userEmail: user.email,
      origin,
      successPath: `${isComedy ? `/comedy-live/${contextId}` : `/concert-watch/${contextId}`}?gift=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelPath: `${isComedy ? `/comedy-live/${contextId}` : `/concert-watch/${contextId}`}?gift=canceled`,
      metadata: { sender_id: user.id,
        concert_id: contextId,
        show_id: isComedy ? contextId : "",
        receiver_id: receiverId,
        gift_id: giftId,
        message: message || "",
        type: isComedy ? "comedy_gift" : "concert_gift" } });

    await admin.from("sent_platform_gifts").insert({ sender_id: user.id,
      receiver_id: receiverId,
      gift_id: giftId,
      context_type: isComedy ? "comedy" : "concert",
      context_id: contextId,
      message: message || null,
      amount: gift.price,
      status: "pending",
      stripe_session_id: sessionId }).then((res) => {
      if (res.error) console.error("sent_platform_gifts insert failed:", res.error.message);
    });

    return new Response(JSON.stringify({ url, session_id: sessionId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    console.error("Concert gift error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    const status = /unauthorized/i.test(msg) ? 401 : /missing|not found|required/i.test(msg) ? 400 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status });
  }
});
