// Send gift to influencer – wrapper for shared one-off router
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createOneOffSession } from "../_shared/oneOffCheckout.ts";

const GiftRequestSchema = z.object({
  influencerId: z.string().uuid("Invalid influencer ID"),
  giftId: z.string().uuid("Invalid gift ID"),
  message: z.string().max(500).trim().optional().transform((v) => v || ""),
});

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

    const validation = GiftRequestSchema.safeParse(await req.json());
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const { influencerId, giftId, message } = validation.data;

    const { data: influencer, error: infErr } = await supabase
      .from("influencer_profiles")
      .select("user_id")
      .eq("id", influencerId)
      .single();
    if (infErr || !influencer) throw new Error("Influencer not found");
    if (influencer.user_id === user.id) {
      return new Response(
        JSON.stringify({ error: "You cannot send a gift to yourself" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: gift, error: giftErr } = await supabase
      .from("influencer_gifts")
      .select("*")
      .eq("id", giftId)
      .eq("is_active", true)
      .single();
    if (giftErr || !gift) throw new Error("Gift not found or not available");

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const { url, sessionId } = await createOneOffSession({
      productKey: "influencer_gift",
      amount: Math.round(Number(gift.price) * 100),
      name: `${gift.icon} ${gift.name}`,
      description: message || gift.description || "Virtual gift for Influencer",
      userId: user.id,
      userEmail: user.email,
      origin,
      successPath: `/influ-king?success=true&type=gift`,
      cancelPath: `/influ-king?canceled=true`,
      metadata: {
        sender_id: user.id,
        influencer_id: influencerId,
        gift_id: giftId,
        message: message || "",
        type: "influencer_gift",
        amount: gift.price.toString(),
      },
    });

    // Pre-record gift with pending status
    const { error: insertError } = await supabase.from("influencer_sent_gifts").insert({
      sender_id: user.id,
      influencer_id: influencerId,
      gift_id: giftId,
      amount: gift.price,
      message: message || null,
      status: "pending",
      stripe_session_id: sessionId,
    });
    if (insertError) console.error("Error inserting gift record:", insertError);

    return new Response(JSON.stringify({ url, sessionId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating influencer gift payment:", error);
    const msg = error instanceof Error ? error.message : String(error);
    const status = /not authenticated|unauthorized/i.test(msg) ? 401
      : /missing|not found|already have|unsupported|required/i.test(msg) ? 400
      : 500;
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status,
    });
  }
});
