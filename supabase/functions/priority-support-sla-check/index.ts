import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Find priority-support tickets whose SLA expired without a first response
  const { data: breached, error } = await supabase
    .from("support_tickets")
    .select("id, ticket_number, subject, user_id, name, email, sla_response_due_at")
    .eq("is_priority_support", true)
    .is("first_response_at", null)
    .is("sla_breached_at", null)
    .lt("sla_response_due_at", new Date().toISOString())
    .limit(100);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!breached?.length) {
    return new Response(JSON.stringify({ checked: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Mark breached
  const ids = breached.map((t) => t.id);
  await supabase
    .from("support_tickets")
    .update({ sla_breached_at: new Date().toISOString() })
    .in("id", ids);

  // Find admins
  const { data: admins } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");

  const adminIds = (admins ?? []).map((a) => a.user_id);

  // Build notifications for each admin × ticket
  const rows = [];
  for (const t of breached) {
    for (const adminId of adminIds) {
      rows.push({
        user_id: adminId,
        type: "priority_support_sla_breach",
        title: "Priority Support SLA breached",
        message: `Ticket ${t.ticket_number ?? t.id.slice(0, 8)} from ${t.name} (${t.email}) has exceeded the 4-hour response window: "${t.subject}"`,
        related_id: t.id,
        action_url: `/admin/support?ticket=${t.id}`,
        metadata: { ticket_id: t.id, due_at: t.sla_response_due_at },
        is_read: false,
      });
    }
  }

  if (rows.length) {
    await supabase.from("notifications").insert(rows);
  }

  // Also email priority support team
  try {
    const priorityEmail = Deno.env.get("PRIORITY_SUPPORT_EMAIL") ?? "priority@uniqueapp.fun";
    for (const t of breached) {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "priority-support-sla-breach",
          recipientEmail: priorityEmail,
          idempotencyKey: `sla-breach-${t.id}`,
          templateData: {
            ticketNumber: t.ticket_number ?? t.id.slice(0, 8),
            subject: t.subject,
            customerName: t.name,
            customerEmail: t.email,
            ticketId: t.id,
          },
        },
      }).catch(() => {});
    }
  } catch (_) { /* email is best-effort */ }

  return new Response(JSON.stringify({ breached: breached.length, notified_admins: adminIds.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
