import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Reads the signed-in user's unified `ai_credits` balance directly.
 * Used as a fallback so a stale/failed parent fetch can never falsely lock
 * AI buttons with "Need X credits" for some users.
 */
export function useLiveAiCredits(fallback = 0) {
  const [credits, setCredits] = useState(fallback);

  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!error) setCredits(data?.credits_remaining ?? 0);
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("ai-credits-updated", onUpdate);
    return () => window.removeEventListener("ai-credits-updated", onUpdate);
  }, [refresh]);

  return { credits: Math.max(credits, fallback), refresh };
}
