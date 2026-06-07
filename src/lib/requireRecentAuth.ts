import { supabase } from "@/integrations/supabase/client";

/**
 * P4: Step-up auth — verify the current user signed in within the last
 * `maxAgeSec` seconds. Use before sensitive actions (email change, payout,
 * account deletion). Returns true if fresh, false otherwise.
 *
 * Frontend gate only — sensitive RPCs/edge functions MUST also re-check
 * server-side (e.g. via auth.jwt() -> auth_time).
 */
export async function requireRecentAuth(maxAgeSec: number = 300): Promise<{
  ok: boolean;
  ageSec: number | null;
}> {
  const { data } = await supabase.auth.getUser();
  const ts = data?.user?.last_sign_in_at;
  if (!ts) return { ok: false, ageSec: null };
  const ageSec = (Date.now() - new Date(ts).getTime()) / 1000;
  return { ok: ageSec <= maxAgeSec, ageSec };
}

/**
 * Re-authenticate the current user with their password without disturbing
 * the active session. Returns true on success.
 */
export async function reauthenticateWithPassword(password: string): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  const email = userData?.user?.email;
  if (!email) return false;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return !error;
}
