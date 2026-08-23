import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export type MegatalentTier = "premium" | "top_premium";

/**
 * Starts a MegaTalent subscription checkout.
 *
 * Uses supabase.functions.invoke first; if the SDK request fails at the network
 * layer (mobile hiccup, "Failed to send a request to the Edge Function"),
 * it retries once with a plain fetch so the user isn't blocked.
 */
export async function startMegatalentCheckout(
  tier: MegatalentTier,
  referralCode?: string,
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Please log in first to subscribe.");

  const body = {
    product: "megatalent_subscription",
    tier,
    referralCode: referralCode?.trim().toUpperCase() || undefined,
  };

  const readUrl = (payload: any) => {
    const url = payload?.url;
    if (!url) throw new Error(payload?.error || "No checkout URL returned");
    return url as string;
  };

  try {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body,
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (error) throw error;
    return readUrl(data);
  } catch (primaryError: any) {
    // Direct fallback — bypasses the SDK layer entirely.
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error || `Checkout failed (${res.status})`);
      }
      return readUrl(payload);
    } catch (fallbackError: any) {
      throw new Error(
        fallbackError?.message || primaryError?.message || "Could not start checkout.",
      );
    }
  }
}
