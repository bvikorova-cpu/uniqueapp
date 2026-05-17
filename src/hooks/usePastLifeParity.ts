import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invokeOrThrow } from "@/utils/safeInvoke";

export type PastLifeParityAction =
  | "soul-origin"
  | "karmic-debt"
  | "reincarnation-timeline"
  | "soul-tribe"
  | "lesson-workbook"
  | "animal-elemental"
  | "famous-match"
  | "death-reflection";

export const PAST_LIFE_PARITY_COST = 6;

export const usePastLifeParity = () => {
  const qc = useQueryClient();

  const run = useMutation({
    mutationFn: async ({
      action,
      payload,
    }: {
      action: PastLifeParityAction;
      payload: Record<string, unknown>;
    }) => {
      const result = await invokeOrThrow("past-life-parity", {
        body: { action, payload },
      });
      if (result?.requiresPayment) throw new Error("INSUFFICIENT_CREDITS");
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["past-life-credits"] });
    },
    onError: (e: Error) => {
      if (e.message === "INSUFFICIENT_CREDITS") {
        toast.error("Insufficient credits. Please purchase more credits.");
      } else {
        toast.error(e.message || "Failed to generate reading");
      }
    },
  });

  return {
    run: run.mutateAsync,
    isRunning: run.isPending,
    lastResult: run.data?.result,
    lastAction: run.variables?.action,
  };
};
