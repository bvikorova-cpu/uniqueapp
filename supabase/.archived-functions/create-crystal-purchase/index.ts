// Crystal marketplace purchase – wrapper for shared one-off router
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { createOneOffSession } from "../_shared/oneOffCheckout.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: any) =>
  console.log(`[CREATE-CRYSTAL-PURCHASE] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  try {
    log("Function started");
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabase.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { itemId, shippingAddress } = await req.json();

    const { data: item, error: itemError } = await supabase
      .from("crystal_marketplace_items")
      .select("*")
      .eq("id", itemId)
      .single();
    if (itemError || !item) throw new Error("Item not found");
    if (!item.is_available) throw new Error("Item no longer available");

    // 15% platform commission
    const platformCommission = Number((item.price * 0.15).toFixed(2));
    const sellerAmount = Number((item.price - platformCommission).toFixed(2));

    const { data: order, error: orderError } = await supabase
      .from("crystal_marketplace_orders")
      .insert({
        item_id: itemId,
        buyer_id: user.id,
        seller_id: item.seller_id,
        amount: item.price,
        platform_commission: platformCommission,
        seller_amount: sellerAmount,
        shipping_address: shippingAddress,
        status: "pending",
      })
      .select()
      .single();
    if (orderError) throw orderError;

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const { url, sessionId } = await createOneOffSession({
      productKey: "crystal_purchase",
      amount: Math.round(Number(item.price) * 100),
      name: item.title,
      description: `${item.crystal_type} - ${item.weight_grams}g`,
      images: item.image_url ? [item.image_url] : undefined,
      userId: user.id,
      userEmail: user.email,
      origin,
      successPath: `/crystal-marketplace?success=true&order_id=${order.id}`,
      cancelPath: `/crystal-marketplace?canceled=true`,
      metadata: {
        type: "crystal_purchase",
        order_id: order.id,
        item_id: itemId,
        buyer_id: user.id,
      },
    });

    // Link Stripe session to order so verify-* can finalize it
    await supabase
      .from("crystal_marketplace_orders")
      .update({ stripe_payment_id: sessionId })
      .eq("id", order.id);

    log("Checkout session created", { orderId: order.id });
    return new Response(JSON.stringify({ url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    log("ERROR", { message: error instanceof Error ? error.message : "Unknown error" });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
