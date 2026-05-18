import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ReincarnationParityAction =
  | "soul-origin"
  | "karmic-thread"
  | "reincarnation-timeline"
  | "soul-contract"
  | "past-life-letter"
  | "dharma-path"
  | "twin-flame-report"
  | "rebirth-blueprint";

export const REINCARNATION_PARITY_COST = 5;

export function useReincarnationParity() {
  const { toast } = useToast();

  const run = useMutation({
    mutationFn: async ({ action, payload }: { action: ReincarnationParityAction; payload: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke("reincarnation-parity", {
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
      toast({ title: "Done", description: `Spent ${REINCARNATION_PARITY_COST} credits` });
    },
  });

  return { run: run.mutateAsync, isLoading: run.isPending, data: run.data?.result };
}
