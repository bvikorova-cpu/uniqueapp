import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type DnaParityAction =
  | "ancestral-storyteller"
  | "heritage-map"
  | "genetic-compatibility"
  | "offspring-predictor"
  | "health-blueprint"
  | "dna-art-prompt"
  | "ancestor-voice-script"
  | "family-tree-narrative";

export const DNA_PARITY_COST = 5;

export function useDnaParity() {
  const { toast } = useToast();

  const run = useMutation({
    mutationFn: async ({ action, payload }: { action: DnaParityAction; payload: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke("dna-parity", {
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
      toast({ title: "Done", description: `Spent ${DNA_PARITY_COST} credits` });
    },
  });

  return { run: run.mutateAsync, isLoading: run.isPending, data: run.data?.result };
}
