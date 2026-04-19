import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type AIFeature =
  | "icebreakers"
  | "compatibility"
  | "reply_coach"
  | "personality_mirror"
  | "voice_preview"
  | "date_ideas"
  | "love_letter";

export const AI_COSTS: Record<AIFeature, number> = {
  icebreakers: 3,
  compatibility: 5,
  reply_coach: 2,
  personality_mirror: 8,
  voice_preview: 10,
  date_ideas: 5,
  love_letter: 15,
};

export function useAnonymousDateAI() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<AIFeature | null>(null);
  const [result, setResult] = useState<{ feature: AIFeature; output: any } | null>(null);

  const run = async (feature: AIFeature, payload: any, matchId?: string) => {
    setLoading(feature);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("anonymous-date-ai", {
        body: { feature, payload, matchId },
      });

      if (error) {
        // Try to read structured error
        const msg = (error as any)?.message ?? "";
        if (msg.includes("402") || msg.includes("INSUFFICIENT")) {
          toast({ title: "Not enough credits", description: "Please buy more credits to use this AI feature.", variant: "destructive" });
        } else if (msg.includes("429")) {
          toast({ title: "AI is busy", description: "Try again in a moment.", variant: "destructive" });
        } else {
          toast({ title: "AI error", description: msg || "Try again later.", variant: "destructive" });
        }
        return null;
      }

      if (data?.error) {
        toast({ title: "AI error", description: data.message ?? data.error, variant: "destructive" });
        return null;
      }

      setResult({ feature, output: data.output });
      toast({ title: "Done!", description: `Used ${AI_COSTS[feature]} credits. ${data.credits_remaining} left.` });
      return data;
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "Failed", variant: "destructive" });
      return null;
    } finally {
      setLoading(null);
    }
  };

  return { run, loading, result, setResult };
}
