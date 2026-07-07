// Patient submits an insurance claim tied to a completed appointment.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const Body = z.object({
  appointment_id: z.string().uuid().optional(),
  insurance_card_id: z.string().uuid(),
  amount_cents: z.number().int().min(0).max(2_000_000),
  receipt_url: z.string().url().optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const jwt = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: u } = await admin.auth.getUser(jwt);
    const user = u.user;
    if (!user) return json({ error: "unauthorized" }, 401);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);

    const { data: card } = await admin
      .from("insurance_cards")
      .select("id, patient_id")
      .eq("id", parsed.data.insurance_card_id)
      .maybeSingle();
    if (!card || card.patient_id !== user.id) return json({ error: "invalid_card" }, 403);

    const { data: claim, error } = await admin
      .from("insurance_claims")
      .insert({
        patient_id: user.id,
        appointment_id: parsed.data.appointment_id ?? null,
        insurance_card_id: parsed.data.insurance_card_id,
        amount_cents: parsed.data.amount_cents,
        receipt_url: parsed.data.receipt_url ?? null,
      })
      .select("id, status")
      .single();
    if (error) return json({ error: error.message }, 500);

    // Best-effort admin notification
    await admin.from("notifications").insert({
      user_id: user.id,
      type: "insurance_claim_submitted",
      title: "Insurance claim submitted",
      body: `Claim #${claim.id.slice(0, 8)} is pending review.`,
    }).then(() => {}, () => {});

    return json({ id: claim.id, status: claim.status });
  } catch (e) {
    console.error("submit-insurance-claim", e);
    return json({ error: "internal" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
