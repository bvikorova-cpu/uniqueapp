import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type ForgeAction =
  | "brainstorm"
  | "describe"
  | "expand"
  | "rewrite"
  | "shorten"
  | "seo_optimize"
  | "plagiarism_check"
  | "translate"
  | "score_content";

export const FORGE_AI_COST = 6;

export function useForgeAITools(onCreditsRefresh?: () => void) {
  const [loading, setLoading] = useState<ForgeAction | null>(null);

  const run = async <T = any>(
    action: ForgeAction,
    text: string,
    extra: Record<string, any> = {},
  ): Promise<{ content: string; parsed: T | null; creditsRemaining: number } | null> => {
    setLoading(action);
    try {
      const { data, error } = await supabase.functions.invoke("forge-ai-tools", {
        body: { action, text, extra },
      });
      if (error) throw error;
      if (data?.error === "INSUFFICIENT_CREDITS") {
        toast({
          title: "Not enough credits",
          description: `You need ${FORGE_AI_COST} credits for this action.`,
          variant: "destructive",
        });
        return null;
      }
      if (data?.error) {
        toast({ title: "AI error", description: data.error, variant: "destructive" });
        return null;
      }
      onCreditsRefresh?.();
      return data;
    } catch (e: any) {
      toast({ title: "Action failed", description: e?.message ?? String(e), variant: "destructive" });
      return null;
    } finally {
      setLoading(null);
    }
  };

  return { run, loading };
}
