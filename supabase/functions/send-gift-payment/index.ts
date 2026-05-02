// Send virtual gift to creator – wrapper for shared one-off router
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
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
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

    const { giftId, creatorId, message } = await req.json();

    const { data: gift, error: giftError } = await supabase
      .from("virtual_gifts")
      .select("*")
      .eq("id", giftId)
      .single();
    if (giftError || !gift) throw new Error("Gift not found");

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const { url } = await createOneOffSession({
      productKey: "platform_gift",
      amount: Math.round(Number(gift.price) * 100),
      name: `Gift: ${gift.name}`,
      description: `Virtual gift for creator`,
      userId: user.id,
      userEmail: user.email,
      origin,
      successPath: `/creator/${creatorId}?gift_success=true`,
      cancelPath: `/creator/${creatorId}?gift_canceled=true`,
      metadata: {
        type: "platform_gift",
        gift_id: giftId,
        creator_id: creatorId,
        sender_id: user.id,
        message: message || "",
        gift_price: String(gift.price),
      },
    });

    return new Response(JSON.stringify({ url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
