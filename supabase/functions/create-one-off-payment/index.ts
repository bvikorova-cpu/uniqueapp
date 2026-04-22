// Universal one-off Stripe checkout router
// Usage from client:
//   supabase.functions.invoke('create-one-off-payment', {
//     body: { productKey: 'job_listing_7', metadata: { jobListingId: '...' } }
//   })
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { createOneOffSession, PRODUCTS } from "../_shared/oneOffCheckout.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { productKey, amount, name, description, images, metadata = {}, successPath, cancelPath } = body;

    if (!PRODUCTS[productKey]) {
      return new Response(
        JSON.stringify({ error: `Unknown productKey: ${productKey}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Optional auth — pass through user email/id when available
    let userEmail: string | undefined;
    let userId: string | undefined;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      );
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      userEmail = data.user?.email ?? undefined;
      userId = data.user?.id;
    }

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const { url, sessionId } = await createOneOffSession({
      productKey,
      amount,
      name,
      description,
      images,
      metadata,
      userId,
      userEmail,
      origin,
      successPath,
      cancelPath,
    });

    return new Response(JSON.stringify({ url, sessionId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("create-one-off-payment error:", error);
    const status = error.message?.includes("Authentication required") ? 401 : 500;
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
