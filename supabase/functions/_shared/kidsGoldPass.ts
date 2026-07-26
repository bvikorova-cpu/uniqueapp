// Shared helper: returns true if the authenticated user has an active
// Kids Gold Pass (or any Kids-tier subscription that unlocks all Kids modules).
// Calls the universal `check-subscription` edge function so product/price ID
// logic stays centralized there.
export async function hasKidsGoldPass(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;
  try {
    const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/check-subscription`;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
        "apikey": Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      },
      body: JSON.stringify({ tier: "kids" }),
    });
    if (!r.ok) return false;
    const j = await r.json();
    return !!j?.subscribed;
  } catch (e) {
    console.error("[kidsGoldPass] check failed:", e);
    return false;
  }
}
