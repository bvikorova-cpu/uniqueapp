// Shared helper: Kids Gold Pass was retired — the Kids Channel is now fully
// credit-based via the unified `ai_credits` balance.
//
// This helper is kept (same export name) so all Kids edge functions keep
// compiling, but it now only returns `true` for platform admins, who keep
// unlimited access for testing/support. Everyone else pays with credits.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export async function hasKidsGoldPass(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;
  try {
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const authClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !userData.user?.id) return false;

    const svc = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: role } = await svc
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    return !!role;
  } catch (e) {
    console.error("[kidsGoldPass] admin check failed:", e);
    return false;
  }
}
