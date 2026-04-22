// AR preview – legacy wrapper, now powered by shared one-off router
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
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabase.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { productId } = await req.json();
    if (!productId) throw new Error("Product ID required");

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const { url } = await createOneOffSession({
      productKey: "ar_preview",
      userId: user.id,
      userEmail: user.email,
      origin,
      successPath: `/home-decor?ar_success=true&product_id=${productId}`,
      cancelPath: `/home-decor?ar_canceled=true`,
      metadata: { user_id: user.id, product_id: productId, type: "ar_preview" },
    });

    // Track preview session
    await supabase.from("ar_preview_sessions").insert({
      user_id: user.id,
      product_id: productId,
      payment_status: "pending",
      amount: 0.99,
    });

    return new Response(JSON.stringify({ url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("AR preview payment error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
