// Verify a creator gift Stripe checkout after redirect and mark it paid.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.object({ id: z.string().uuid(),
  sessionId: z.string().optional() });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Stripe not configured" }, 500);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Invalid input" }, 400);
    const { id, sessionId } = parsed.data;

    const { data: tx, error } = await supabase
      .from("creator_gift_transactions")
      .select("id, status, stripe_session_id, sender_id, creator_id, gift_id, amount, message")
      .eq("id", id)
      .maybeSingle();
    if (error || !tx) return json({ error: "Not found" }, 404);
    if (tx.status === "paid") return json({ status: "paid" });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const useSessionId = sessionId || tx.stripe_session_id;
    if (!useSessionId) return json({ status: tx.status });

    const session = await stripe.checkout.sessions.retrieve(useSessionId);
    if (session.payment_status === "paid") {
      const { error: updErr } = await supabase
        .from("creator_gift_transactions")
        .update({ status: "paid" })
        .eq("id", id)
        .eq("status", "pending"); // idempotent guard: only fire notification on transition

      if (!updErr) {
        try {
          const [{ data: sender }, { data: gift }] = await Promise.all([
            supabase.from("profiles").select("username, display_name").eq("id", tx.sender_id).maybeSingle(),
            tx.gift_id
              ? supabase.from("creator_gifts").select("name, icon").eq("id", tx.gift_id).maybeSingle()
              : Promise.resolve({ data: null }),
          ]);
          const senderName = sender?.display_name || sender?.username || "Someone";
          const giftName = gift?.name ? `${gift.icon ?? "🎁"} ${gift.name}` : "a gift";
          const amountStr = `€${Number(tx.amount).toFixed(2)}`;
          const msgSuffix = tx.message ? ` — "${String(tx.message).slice(0, 140)}"` : "";
          await supabase.from("notifications").insert({
            user_id: tx.creator_id,
            type: "creator_gift_received",
            title: "New gift received 🎁",
            message: `${senderName} sent you ${giftName} (${amountStr})${msgSuffix}`,
            related_id: tx.id });
        } catch (nerr) {
          console.error("[verify-creator-gift] notification failed", nerr);
        }
      }
      return json({ status: "paid" });
    }
    return json({ status: session.payment_status || "pending" });
  } catch (e: any) {
    console.error("[verify-creator-gift]", e);
    return json({ error: e?.message || "Failed" }, 500);
  }
});
