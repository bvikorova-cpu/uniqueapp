import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const VIDEO_CREDIT_PACKS = [
  { credits: 10, priceEur: 5, label: "Starter" },
  { credits: 20, priceEur: 10, label: "Popular" },
  { credits: 30, priceEur: 15, label: "Creator" },
] as const;

export const VIDEO_BOOST_TIERS = [
  {
    tier: "quick" as const,
    name: "Quick Boost",
    credits: 5,
    hours: 6,
    desc: "Your video is highlighted at the top of the feed for 6 hours.",
  },
  {
    tier: "daily" as const,
    name: "Daily Top",
    credits: 12,
    hours: 24,
    desc: "Guaranteed placement in the “Hot” section for 24 hours.",
  },
  {
    tier: "mega" as const,
    name: "Mega Boost",
    credits: 25,
    hours: 72,
    desc: "“Featured” badge + priority placement for 3 days.",
  },
];

export type VideoBoostTier = (typeof VIDEO_BOOST_TIERS)[number]["tier"];

export function useVideoCredits() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      setBalance(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      setBalance(data?.credits_remaining ?? 0);
    } catch (e) {
      console.error("[useVideoCredits]", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener("video-credits-updated", handler);
    return () => window.removeEventListener("video-credits-updated", handler);
  }, [load]);

  const purchase = useCallback(async (credits: number) => {
    setBuying(credits);
    // Pre-open a tab during the user gesture so mobile browsers don't block it.
    // NOTE: never null out `opener` here — some mobile browsers then ignore
    // later `location` writes and the tab stays on about:blank.
    let checkoutWindow: Window | null = null;
    try {
      checkoutWindow = window.open("about:blank", "_blank");
    } catch {
      checkoutWindow = null;
    }
    try {
      const { data, error } = await supabase.functions.invoke("create-video-credits-payment", {
        body: { credits },
      });
      if (error) throw error;
      const url = data?.url as string | undefined;
      if (!url) throw new Error(data?.error || "Checkout link missing");

      if (checkoutWindow && !checkoutWindow.closed) {
        try {
          checkoutWindow.location.href = url;
        } catch {
          checkoutWindow.close();
          window.location.href = url;
        }
      } else {
        window.location.href = url;
      }
    } catch (e: any) {
      try {
        checkoutWindow?.close();
      } catch {
        /* noop */
      }
      toast.error("Checkout failed", { description: e?.message });
    } finally {
      setBuying(null);
    }
  }, []);


  return { balance, loading, buying, purchase, refresh: load };
}
