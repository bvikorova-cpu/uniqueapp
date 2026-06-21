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

    // SCALE: batch DB ops so 500-user actions don't fan out to 1500+ serial
    // round-trips and time out the edge function.
    try {
      if (action === "shadow_ban" || action === "unshadow_ban") {
        const value = action === "shadow_ban";
        const { error } = await supabase
          .from("profiles")
          .update({ is_shadow_banned: value })
          .in("id", userIds);
        if (error) throw error;
        succeeded = userIds.length;
      } else if (action === "grant_credits") {
        const amount = Number(params.amount ?? 0);
        if (amount <= 0) throw new Error("amount required");
        const rows = userIds.map(uid => ({
          user_id: uid,
          amount,
          type: "admin_grant",
          description: params.note ?? "Admin bulk grant",
        }));
        const { error } = await supabase.from("ai_credit_transactions").insert(rows);
        if (error) throw error;
        succeeded = userIds.length;
      } else if (action === "delete_user") {
        // auth.admin.deleteUser cannot be batched. Run with bounded concurrency
        // so we don't hammer the GoTrue admin API.
        const CONCURRENCY = 5;
        for (let i = 0; i < userIds.length; i += CONCURRENCY) {
          const slice = userIds.slice(i, i + CONCURRENCY);
          const results = await Promise.allSettled(
            slice.map(uid => supabase.auth.admin.deleteUser(uid))
          );
          for (let j = 0; j < results.length; j++) {
            const r = results[j];
            if (r.status === "fulfilled" && !(r.value as any)?.error) {
              succeeded++;
            } else {
              failed++;
              const msg = r.status === "rejected"
                ? (r.reason?.message || "err")
                : ((r.value as any)?.error?.message || "err");
              errors.push(`${slice[j]}: ${msg}`);
            }
          }
        }
      } else if (action === "send_email") {
        // Placeholder — wired into your email provider later
        console.log("send_email", userIds.length, params.subject);
        succeeded = userIds.length;
      }
    } catch (e: any) {
      failed = userIds.length - succeeded;
      errors.push(e?.message || "batch failed");
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
