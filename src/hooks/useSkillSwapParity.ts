import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invokeOrThrow } from "@/utils/safeInvoke";

export type SkillSwapParityAction =
  | "swap-matcher"
  | "learning-roadmap"
  | "teaching-script"
  | "gap-analysis"
  | "negotiation-helper"
  | "portfolio-pitch"
  | "cultural-tips"
  | "certification-path";

export const SKILL_SWAP_PARITY_COST = 6;

export const useSkillSwapParity = () => {
  const qc = useQueryClient();

  const run = useMutation({
    mutationFn: async ({
      action,
      payload,
    }: {
      action: SkillSwapParityAction;
      payload: Record<string, unknown>;
    }) => {
      const result = await invokeOrThrow("skill-swap-parity", {
        body: { action, payload },
      });
      if (result?.requiresPayment) throw new Error("INSUFFICIENT_CREDITS");
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["skill-swap-credits"] });
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
