// Admin approves / rejects / marks-paid an insurance claim.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const Body = z.object({
  claim_id: z.string().uuid(),
  decision: z.enum(["approved", "rejected", "paid"]),
  admin_note: z.string().max(2000).optional(),
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

    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: user.id, _role: "admin",
    });
    if (!isAdmin) return json({ error: "forbidden" }, 403);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);

    const { data: claim, error } = await admin
      .from("insurance_claims")
      .update({
        status: parsed.data.decision,
        admin_note: parsed.data.admin_note ?? null,
        decided_by: user.id,
        decided_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.claim_id)
      .select("id, patient_id, status")
      .single();
    if (error) return json({ error: error.message }, 500);

    await admin.from("notifications").insert({
      user_id: claim.patient_id,
      type: "insurance_claim_decision",
      title: `Claim ${claim.status}`,
      body: `Your insurance claim was marked ${claim.status}.`,
    }).then(() => {}, () => {});

    return json({ ok: true, status: claim.status });
  } catch (e) {
    console.error("admin-decide-insurance-claim", e);
    return json({ error: "internal" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
