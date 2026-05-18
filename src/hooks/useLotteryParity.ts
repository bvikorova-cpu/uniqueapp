import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invokeOrThrow } from "@/utils/safeInvoke";

export type LotteryParityAction =
  | "wheel-builder"
  | "syndicate-strategy"
  | "tax-planner"
  | "claim-checklist"
  | "budget-coach"
  | "lucky-charm"
  | "pattern-detector"
  | "winner-mindset";

export const LOTTERY_PARITY_COST = 5;

export const useLotteryParity = () => {
  const qc = useQueryClient();

  const run = useMutation({
    mutationFn: async ({
      action,
      payload,
    }: {
      action: LotteryParityAction;
      payload: Record<string, unknown>;
    }) => {
      const result = await invokeOrThrow("lottery-parity", { body: { action, payload } });
      if (result?.requiresPayment) throw new Error("INSUFFICIENT_CREDITS");
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lottery-parity-credits"] });
    },
    onError: (e: Error) => {
      if (e.message === "INSUFFICIENT_CREDITS") {
        toast.error("Insufficient credits. Please purchase more credits.");
      } else {
        toast.error(e.message || "Failed to generate result");
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
