import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type TuningFeature = "dream_decoder" | "numerology" | "heatmap_analysis";

export const TUNING_COSTS: Record<TuningFeature, number> = {
  dream_decoder: 5,
  numerology: 3,
  heatmap_analysis: 4,
};

export function useLotteryTuningAI() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<TuningFeature | null>(null);

  const run = async <T = any>(feature: TuningFeature, payload: Record<string, any>): Promise<T | null> => {
    setLoading(feature);
    try {
      const { data, error } = await supabase.functions.invoke("lottery-tuning-ai", {
        body: { feature, payload },
      });
      if (error) {
        const msg = (error as any)?.message ?? "";
        if (msg.includes("402") || msg.toLowerCase().includes("insufficient")) {
          toast({ title: "Not enough credits", description: `Top up your AI credits to use this feature.`, variant: "destructive" });
        } else if (msg.includes("429")) {
          toast({ title: "AI is busy", description: "Try again in a moment.", variant: "destructive" });
        } else {
          toast({ title: "AI error", description: msg || "Try again later.", variant: "destructive" });
        }
        return null;
      }
      if ((data as any)?.error) {
        toast({ title: "AI error", description: (data as any).message ?? (data as any).error, variant: "destructive" });
        return null;
      }
      toast({ title: "Done!", description: `Used ${TUNING_COSTS[feature]} credits. ${(data as any).credits_remaining} left.` });
      return (data as any).output as T;
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "Failed", variant: "destructive" });
      return null;
    } finally {
      setLoading(null);
    }
  };

  return { run, loading };
}
