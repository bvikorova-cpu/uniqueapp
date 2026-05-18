import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type CrystalParityAction =
  | "birth-chart-crystals"
  | "ritual-designer"
  | "grid-layout"
  | "dream-decoder"
  | "affirmation-pack"
  | "intention-setter"
  | "aura-color-coach"
  | "space-clearing";

export const CRYSTAL_PARITY_COST = 5;

export function useCrystalParity() {
  const { toast } = useToast();

  const run = useMutation({
    mutationFn: async ({ action, payload }: { action: CrystalParityAction; payload: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke("crystal-parity", {
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
      toast({ title: "Done", description: `Spent ${CRYSTAL_PARITY_COST} credits` });
    },
  });

  return { run: run.mutateAsync, isLoading: run.isPending, data: run.data?.result };
}
