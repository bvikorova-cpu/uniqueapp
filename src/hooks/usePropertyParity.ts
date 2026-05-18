import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invokeOrThrow } from "@/utils/safeInvoke";

export type PropertyParityAction =
  | "listing-optimizer"
  | "pricing-strategy"
  | "buyer-persona"
  | "negotiation-coach"
  | "staging-brief"
  | "neighborhood-pitch"
  | "rental-yield"
  | "legal-checklist";

export const PROPERTY_PARITY_COST = 5;

export const usePropertyParity = () => {
  const qc = useQueryClient();

  const run = useMutation({
    mutationFn: async ({ action, payload }: { action: PropertyParityAction; payload: Record<string, unknown> }) => {
      const result = await invokeOrThrow("property-parity", { body: { action, payload } });
      if (result?.requiresPayment) throw new Error("INSUFFICIENT_CREDITS");
      return result;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["property-parity-credits"] }),
    onError: (e: Error) => {
      if (e.message === "INSUFFICIENT_CREDITS") toast.error("Insufficient credits. Please purchase more credits.");
      else toast.error(e.message || "Failed to generate result");
    },
  });

  return {
    run: run.mutateAsync,
    isRunning: run.isPending,
    lastResult: run.data,
    lastAction: run.variables?.action,
  };
};
