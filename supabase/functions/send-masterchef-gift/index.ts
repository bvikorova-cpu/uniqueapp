// Send gift to MasterChef – wrapper for shared one-off router
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createOneOffSession } from "../_shared/oneOffCheckout.ts";

const GiftRequestSchema = z.object({
  chefId: z.string().uuid("Invalid chef ID"),
  giftId: z.string().uuid("Invalid gift ID"),
  competitionId: z.string().uuid("Invalid competition ID").optional(),
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
    const { chefId, giftId, competitionId, message } = validation.data;

    if (chefId === user.id) {
      return new Response(
        JSON.stringify({ error: "You cannot send a gift to yourself" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: gift, error: giftErr } = await supabase
      .from("masterchef_gifts")
      .select("*")
      .eq("id", giftId)
      .eq("is_active", true)
      .single();
    if (giftErr || !gift) throw new Error("Gift not found or not available");

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const { url, sessionId } = await createOneOffSession({
      productKey: "masterchef_gift",
      amount: Math.round(Number(gift.price) * 100),
      name: `${gift.icon} ${gift.name}`,
      description: message || gift.description || "Virtual gift for MasterChef",
      userId: user.id,
      userEmail: user.email,
      origin,
      successPath: `/masterchef/dashboard?success=true&type=gift`,
      cancelPath: `/masterchef/dashboard?canceled=true`,
      metadata: {
        sender_id: user.id,
        chef_id: chefId,
        gift_id: giftId,
        competition_id: competitionId || "",
        message: message || "",
        type: "masterchef_gift",
        amount: gift.price.toString(),
      },
    });

    const { error: insertError } = await supabase.from("masterchef_sent_gifts").insert({
      sender_id: user.id,
      chef_id: chefId,
      gift_id: giftId,
      competition_id: competitionId || null,
      message: message || null,
      amount: gift.price,
      status: "pending",
    });
    if (insertError) {
      console.error("Error creating gift record:", insertError);
      throw new Error("Failed to create gift record");
    }

    return new Response(JSON.stringify({ url, session_id: sessionId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("MasterChef gift payment error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    const status = /not authenticated|unauthorized/i.test(msg) ? 401
      : /missing|not found|already have|unsupported|required/i.test(msg) ? 400
      : 500;
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status,
    });
  }
});
