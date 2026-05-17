import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ParityFeature =
  | "vibe_decoder"
  | "chemistry_report"
  | "red_flag_scan"
  | "reveal_readiness"
  | "first_meet_plan"
  | "attachment_profile"
  | "chat_translator"
  | "breakup_recovery";

export const PARITY_COST = 6;

export function useAnonymousDateParity() {
  const { toast } = useToast();
  const [loadingKey, setLoadingKey] = useState<ParityFeature | null>(null);
  const [results, setResults] = useState<Partial<Record<ParityFeature, any>>>({});

  const run = async (feature: ParityFeature, payload: any, matchId?: string) => {
    setLoadingKey(feature);
    try {
      const { data, error } = await supabase.functions.invoke("anonymous-date-ai", {
        body: { feature, payload, matchId },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).message || (data as any).error);
      setResults((r) => ({ ...r, [feature]: (data as any).output }));
      toast({ title: "Done", description: `Used ${PARITY_COST} credits.` });
      return (data as any).output;
    } catch (e: any) {
      toast({ title: "Error", description: e.message ?? "Failed", variant: "destructive" });
      return null;
    } finally {
      setLoadingKey(null);
    }
  };

  return { run, loadingKey, results };
}
