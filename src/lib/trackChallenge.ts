import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface CompletedChallenge {
  id: string;
  title: string;
  icon: string;
  xp_reward: number;
}

/**
 * Track a user action against active challenges and award XP on completion.
 * Shows a celebratory toast for each newly completed challenge.
 */
export async function trackChallengeAction(
  action: "post" | "comment" | "reaction" | "story" | "share",
  extraXp = 0,
) {
  try {
    if (extraXp > 0) {
      await supabase.rpc("record_daily_activity", { _xp: extraXp });
    }
    const { data } = await supabase.rpc("track_challenge_action", { _action: action });
    const completed = (data ?? []) as unknown as CompletedChallenge[];

    for (const c of completed) {
      toast({
        title: `${c.icon} Challenge complete!`,
        description: `${c.title} — +${c.xp_reward} XP awarded`,
      });
    }

    window.dispatchEvent(new Event("streak-updated"));
    window.dispatchEvent(new Event("challenges-updated"));
    return completed;
  } catch (err) {
    console.error("trackChallengeAction failed", err);
    return [];
  }
}
