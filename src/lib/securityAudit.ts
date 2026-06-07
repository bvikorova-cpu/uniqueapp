import { supabase } from "@/integrations/supabase/client";

/**
 * P5 — Security audit log helper. Writes to public.security_audit_log via the
 * SECURITY DEFINER RPC `log_security_event`, which stamps user_id from
 * auth.uid() server-side (cannot be forged from the client).
 *
 * Use for sensitive events: email/password change, MFA enroll/unenroll,
 * idle logout, failed re-auth, role change, payout request.
 *
 * Fire-and-forget: failures are logged to the console but never thrown,
 * so audit logging never breaks the user-facing flow.
 */
export type SecurityEventType =
  | "email_change_requested"
  | "email_change_failed"
  | "password_change_succeeded"
  | "password_change_failed"
  | "reauth_succeeded"
  | "reauth_failed"
  | "mfa_enrolled"
  | "mfa_unenrolled"
  | "idle_logout"
  | "manual_signout";

export async function logSecurityEvent(
  eventType: SecurityEventType,
  opts: { resource?: string; metadata?: Record<string, unknown> } = {}
): Promise<void> {
  try {
    const ua =
      typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 512) : null;
    const { error } = await supabase.rpc("log_security_event", {
      _event_type: eventType,
      _resource: opts.resource ?? null,
      _metadata: (opts.metadata ?? {}) as any,
      _user_agent: ua,
    });
    if (error) {
      // eslint-disable-next-line no-console
      console.warn("[securityAudit] log failed", eventType, error.message);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[securityAudit] threw", eventType, err);
  }
}
