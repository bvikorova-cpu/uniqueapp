import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/** Credit prices for the Virtual Escape Room module (credits only, no EUR). */
export const ESCAPE_ROOM_CREDIT_COSTS = {
  play_room: 8,
  season_pass: 20,
  tournament_entry: 5,
} as const;

export type EscapeRoomCreditAction = keyof typeof ESCAPE_ROOM_CREDIT_COSTS;

/**
 * Isolated credit spender for Virtual Escape Room.
 * Uses the unified spend_ai_credits RPC (deduct + ledger row in one atomic call).
 */
export function useEscapeRoomCredits() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const spend = useCallback(
    async (amount: number, reason: string): Promise<boolean> => {
      if (!user) {
        toast.error("Sign in required", { description: "Please log in to continue." });
        return false;
      }
      try {
        const { data, error } = await (supabase as any).rpc("spend_ai_credits", {
          _amount: amount,
          _reason: reason,
          _source: "escape_room",
        });
        if (error) throw error;
        if ((data as any)?.ok) {
          window.dispatchEvent(new Event("ai-credits-updated"));
          return true;
        }
      } catch (e) {
        console.error("Escape room credit spend failed", e);
      }

      toast.error("Not enough credits", {
        description: `This costs ${amount} credit${amount > 1 ? "s" : ""}. Top up to continue.`,
        action: { label: "Top up", onClick: () => navigate("/ai-credits") },
        duration: 6000,
      });
      return false;
    },
    [user, navigate]
  );

  return { spend, costs: ESCAPE_ROOM_CREDIT_COSTS };
}
