// Stripe checkout for Rewards purchases: Battle Pass Premium + EUR Streak Freeze packs.
// Body: { kind: "battle_pass_premium" | "streak_freeze", qty?: number, packEur?: number, seasonId?: string }
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_ORIGIN = "https://uniqueapp.fun";

const FREEZE_PACKS: Record<number, { eur: number; label: string }> = {
  1: { eur: 0.99, label: "Single Freeze" },
  3: { eur: 2.49, label: "Triple Pack" },
  7: { eur: 4.99, label: "Week Shield" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: claims } = await supa.auth.getClaims(auth.replace("Bearer ", ""));
    const user = claims?.claims;
    if (!user?.sub || !user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json().catch(() => ({}));
    const kind = String(body.kind || "");
    const origin = (req.headers.get("origin") || DEFAULT_ORIGIN).replace(/\/$/, "");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    let line_items: any[] = [];
    let metadata: Record<string, string> = { user_id: user.sub, kind };
    let successPath = "/rewards?payment=success&session_id={CHECKOUT_SESSION_ID}";
    const cancelPath = "/rewards?payment=canceled";

    if (kind === "battle_pass_premium") {
      const adminSupa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: season, error: sErr } = await adminSupa
        .from("battle_pass_seasons").select("id, name, premium_price_eur, is_active")
        .eq("is_active", true).order("starts_at", { ascending: false }).limit(1).maybeSingle();
      if (sErr || !season) throw new Error("No active Battle Pass season");
      const eur = Number(season.premium_price_eur || 0);
      if (eur <= 0) throw new Error("Invalid premium price");
      metadata.season_id = String(season.id);
      line_items = [{
        price_data: {
          currency: "eur",
          product_data: { name: `Battle Pass Premium · ${season.name}` },
          unit_amount: Math.round(eur * 100),
        },
        quantity: 1,
      }];
    } else if (kind === "streak_freeze") {
      const qty = Number(body.qty || 0);
      const pack = FREEZE_PACKS[qty];
      if (!pack) throw new Error("Invalid streak freeze pack");
      metadata.qty = String(qty);
      line_items = [{
        price_data: {
          currency: "eur",
          product_data: { name: `Streak Freeze · ${pack.label} (×${qty})` },
          unit_amount: Math.round(pack.eur * 100),
        },
        quantity: 1,
      }];
    } else {
      throw new Error(`Unknown kind: ${kind}`);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items,
      mode: "payment",
      metadata,
      payment_intent_data: { metadata },
      success_url: `${origin}${successPath}`,
      cancel_url: `${origin}${cancelPath}`,
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[create-rewards-checkout]", e);
    return new Response(JSON.stringify({ error: e?.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
