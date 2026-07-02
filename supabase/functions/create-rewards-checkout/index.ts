import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.25.76";

const BodySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("battle_pass_premium") }).passthrough(),
  z.object({ kind: z.literal("streak_freeze"), qty: z.union([z.literal(1), z.literal(3), z.literal(7)]) }).passthrough(),
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !anonKey) {
      return new Response(JSON.stringify({ error: "Supabase environment is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const checkoutResponse = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
      method: "POST",
      headers: {
        "Authorization": req.headers.get("Authorization") ?? "",
        "apikey": req.headers.get("apikey") ?? anonKey,
        "Content-Type": "application/json",
        "Origin": req.headers.get("Origin") ?? "https://uniqueapp.fun",
        "x-client-info": req.headers.get("x-client-info") ?? "unique-rewards-compat",
      },
      body: JSON.stringify({ ...parsed.data, product: "rewards_checkout" }),
    });

    const body = await checkoutResponse.text();
    return new Response(body, {
      status: checkoutResponse.status,
      headers: { ...corsHeaders, "Content-Type": checkoutResponse.headers.get("Content-Type") ?? "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});