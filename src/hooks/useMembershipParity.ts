import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type MembershipParityAction =
  | "tier-designer"
  | "post-planner"
  | "fan-persona"
  | "welcome-dm"
  | "retention-booster"
  | "perk-ideas"
  | "livestream-brief"
  | "growth-funnel";

export const MEMBERSHIP_PARITY_COST = 5;

export function useMembershipParity() {
  const { toast } = useToast();

  const run = useMutation({
    mutationFn: async ({ action, payload }: { action: MembershipParityAction; payload: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke("membership-parity", {
        body: { action, payload },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data as { result: any; cost: number };
    },
    onError: (e: Error) => {
      toast({ title: "AI tool failed", description: e.message, variant: "destructive" });
    },
    onSuccess: () => {
      toast({ title: "Done", description: `Spent ${MEMBERSHIP_PARITY_COST} credits` });
    },
  });

  return { run: run.mutateAsync, isLoading: run.isPending, data: run.data?.result };
}
