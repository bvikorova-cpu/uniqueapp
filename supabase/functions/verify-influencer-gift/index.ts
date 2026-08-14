// Verify Stripe session(s) for InfluKing gifts and mark them completed.
// Supports:
//   { sessionId }  -> verify one checkout session
//   { recover: true } -> scan the caller's recent Stripe sessions for paid
//                        influencer_gift payments that were never recorded
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization") || "";
    let callerId: string | null = null;
    if (authHeader.startsWith("Bearer ")) {
      const { data } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
      callerId = data.user?.id ?? null;
    }

    const body = await req.json().catch(() => ({}));
    const sessionId: string | undefined = body?.sessionId;
    const recover: boolean = !!body?.recover;

    // Upsert one paid session into influencer_sent_gifts
    const settle = async (session: Stripe.Checkout.Session) => {
      if (session.payment_status !== "paid") return false;
      const md = (session.metadata || {}) as Record<string, string>;
      if (md.type !== "influencer_gift" && md.productKey !== "influencer_gift") return false;

      const { data: existing } = await admin
        .from("influencer_sent_gifts")
        .select("id, status")
        .eq("stripe_session_id", session.id)
        .maybeSingle();

      if (existing) {
        if (existing.status !== "completed") {
          await admin
            .from("influencer_sent_gifts")
            .update({ status: "completed" })
            .eq("id", existing.id);
        }
        return true;
      }

      const senderId = md.sender_id || md.userId || callerId;
      if (!senderId || !md.influencer_id || !md.gift_id) return false;

      await admin.from("influencer_sent_gifts").insert({
        sender_id: senderId,
        influencer_id: md.influencer_id,
        gift_id: md.gift_id,
        amount: Number(md.amount || (session.amount_total ?? 0) / 100),
        message: md.message || null,
        status: "completed",
        stripe_session_id: session.id,
      });
      return true;
    };

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const paid = await settle(session);
      return json({ paid, settled: paid });
    }

    if (recover) {
      if (!callerId) return json({ error: "Sign in required" }, 401);
      const list = await stripe.checkout.sessions.list({ limit: 100 });
      let settled = 0;
      for (const s of list.data) {
        const md = (s.metadata || {}) as Record<string, string>;
        if (md.userId !== callerId && md.sender_id !== callerId) continue;
        if (await settle(s)) settled++;
      }
      return json({ settled });
    }

    return json({ error: "Missing sessionId" }, 400);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return json({ error: msg }, 500);
  }
});
