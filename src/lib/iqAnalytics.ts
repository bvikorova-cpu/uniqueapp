import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "iq_session_id";

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "anon";
  }
}

/**
 * Fire-and-forget IQ funnel event tracker.
 * Standard events: iq_view, iq_test_start, iq_test_complete,
 *                  iq_credits_purchase, iq_tool_use, iq_duel_start,
 *                  iq_promo_redeem, iq_referral_click.
 */
export async function trackIQEvent(
  event_name: string,
  properties: Record<string, any> = {},
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("iq_events").insert({
      event_name,
      user_id: user?.id ?? null,
      session_id: getSessionId(),
      path: typeof window !== "undefined" ? window.location.pathname : null,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      properties,
    });
  } catch {
    // silent — analytics must never break UX
  }
}
