import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_TYPES = ["medical", "dream", "hero", "crisis", "pet", "student", "talent"] as const;
const TABLE_MAP: Record<string, string> = {
  medical: "medical_campaigns",
  dream: "dream_campaigns",
  hero: "hero_campaigns",
  crisis: "crisis_campaigns",
  pet: "pet_rescue_campaigns",
  student: "student_campaigns",
  talent: "talent_campaigns",
};
const ALLOWED_ACTIONS = ["approve", "reject", "ban", "flag", "unflag"] as const;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing auth" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) return json({ error: "Invalid auth" }, 401);

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Admin role required" }, 403);

    const body = await req.json();
    const { campaignType, campaignId, action, notes } = body;

    if (!ALLOWED_TYPES.includes(campaignType)) return json({ error: "Invalid campaignType" }, 400);
    if (!ALLOWED_ACTIONS.includes(action)) return json({ error: "Invalid action" }, 400);
    if (!campaignId || typeof campaignId !== "string") return json({ error: "Invalid campaignId" }, 400);

    const table = TABLE_MAP[campaignType];
    const statusMap: Record<string, string> = {
      approve: "approved",
      reject: "rejected",
      ban: "banned",
      flag: "flagged",
      unflag: "approved",
    };

    const { error: updErr } = await supabase
      .from(table)
      .update({
        approval_status: statusMap[action],
        approval_notes: notes ?? null,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        ...(action === "approve" ? { status: "active", verified: true } : {}),
        ...(action === "reject" || action === "ban" ? { status: "rejected" } : {}),
      })
      .eq("id", campaignId);

    if (updErr) return json({ error: updErr.message }, 500);

    // Audit log
    await supabase.from("admin_audit_log").insert({
      admin_id: user.id,
      action: "fundraising_moderation",
      target_type: table,
      target_id: campaignId,
      details: { campaign_type: campaignType, moderation_action: action, notes: notes ?? null },
    });

    return json({ success: true, action, status: statusMap[action] });
  } catch (e: any) {
    console.error("admin-moderate-campaign error", e);
    return json({ error: e.message ?? "Unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
