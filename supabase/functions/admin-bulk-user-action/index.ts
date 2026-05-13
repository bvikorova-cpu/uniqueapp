import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Action = "shadow_ban" | "unshadow_ban" | "grant_credits" | "send_email" | "delete_user";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id, _role: "admin",
    });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json();
    const action = body.action as Action;
    const userIds: string[] = body.userIds ?? [];
    const params = body.params ?? {};

    if (!action || !Array.isArray(userIds) || userIds.length === 0) {
      return json({ error: "action + userIds required" }, 400);
    }
    if (userIds.length > 500) return json({ error: "Max 500 users per batch" }, 400);

    let succeeded = 0, failed = 0;
    const errors: string[] = [];

    for (const uid of userIds) {
      try {
        if (action === "shadow_ban") {
          await supabase.from("profiles").update({ is_shadow_banned: true }).eq("id", uid);
        } else if (action === "unshadow_ban") {
          await supabase.from("profiles").update({ is_shadow_banned: false }).eq("id", uid);
        } else if (action === "grant_credits") {
          const amount = Number(params.amount ?? 0);
          if (amount <= 0) throw new Error("amount required");
          await supabase.from("ai_credit_transactions").insert({
            user_id: uid, amount, type: "admin_grant",
            description: params.note ?? "Admin bulk grant",
          });
        } else if (action === "delete_user") {
          await supabase.auth.admin.deleteUser(uid);
        } else if (action === "send_email") {
          // Placeholder — wired into your email provider later
          console.log("send_email", uid, params.subject);
        }
        succeeded++;
      } catch (e: any) {
        failed++;
        errors.push(`${uid}: ${e?.message || "err"}`);
      }
    }

    await supabase.from("bulk_user_action_log").insert({
      action, target_user_ids: userIds, params, performed_by: user.id,
      succeeded_count: succeeded, failed_count: failed,
      notes: errors.slice(0, 20).join("\n") || null,
    });

    return json({ succeeded, failed, errors: errors.slice(0, 20) });
  } catch (e: any) {
    return json({ error: e?.message || "Internal error" }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
