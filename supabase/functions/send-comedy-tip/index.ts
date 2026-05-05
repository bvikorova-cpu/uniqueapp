import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const showId: string | undefined = body.showId;
    const comedianId: string = body.comedianId;
    const tipType: string = body.tipType || "applause";
    const amount: number = Math.max(1, parseInt(body.amount || "10", 10));
    const message: string | undefined = body.message;

    if (!comedianId) {
      return new Response(JSON.stringify({ error: "comedianId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Atomic spend (server-enforced, no client-side balance check)
    const { error: spendErr } = await userClient.rpc("spend_comedy_coins", { _amount: amount });
    if (spendErr) {
      const status = /insufficient/i.test(spendErr.message) ? 402 : 500;
      return new Response(JSON.stringify({ error: spendErr.message }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: tipErr } = await admin.from("comedy_tips").insert({
      from_user_id: user.id,
      to_comedian_id: comedianId,
      show_id: showId ?? null,
      amount_coins: amount,
      tip_type: tipType,
      message: message ?? null,
    });
    if (tipErr) {
      // Refund on failure
      await admin.rpc("add_comedy_coins", { _user_id: user.id, _amount: amount, _purchased: false });
      throw tipErr;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
