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
  | "love_letter"
  | "daily_question"
  | "conversation_coach";

export const AI_COSTS: Record<AIFeature, number> = { icebreakers: 3,
  compatibility: 5,
  reply_coach: 2,
  personality_mirror: 8,
  voice_preview: 10,
  date_ideas: 5,
  love_letter: 15,
  daily_question: 5,
  conversation_coach: 10 };

export function useAnonymousDateAI() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<AIFeature | null>(null);
  const [result, setResult] = useState<{ feature: AIFeature; output: any } | null>(null);

  const run = async (feature: AIFeature, payload: any, matchId?: string) => {
    setLoading(feature);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("anonymous-date-ai", {
        body: { feature, payload, matchId } });

      if (error) {
        // Read the real server payload (FunctionsHttpError hides it in .context)
        let code = "";
        let detail = "";
        try {
          const res = (error as any)?.context;
          if (res && typeof res.json === "function") {
            const body = await res.clone().json();
            code = body?.error ?? "";
            detail = body?.message ?? "";
          }
        } catch { /* ignore body parse issues */ }

        const msg = `${code} ${detail} ${(error as any)?.message ?? ""}`;
        if (msg.includes("402") || msg.includes("INSUFFICIENT")) {
          toast({ title: "Not enough credits", description: detail || "Please buy more credits to use this AI feature.", variant: "destructive" });
        } else if (msg.includes("429") || msg.includes("RATE_LIMITED")) {
          toast({ title: "AI is busy", description: detail || "Try again in a moment.", variant: "destructive" });
        } else if (msg.includes("UNAUTHORIZED")) {
          toast({ title: "Session expired", description: "Please sign in again to use AI features.", variant: "destructive" });
        } else {
          toast({
            title: "AI error",
            description: [code, detail].filter(Boolean).join(": ") || (error as any)?.message || "Try again later.",
            variant: "destructive",
          });
        }
        console.error("anonymous-date-ai failed", { feature, code, detail });
        return null;
      }


      if (data?.error) {
        toast({ title: "AI error", description: data.message ?? data.error, variant: "destructive" });
        return null;
      }

      setResult({ feature, output: data.output });
      const { data: { user } } = await supabase.auth.getUser();
      let currentBalance: number | null = null;

      if (user) {
        const { data: creditRow, error: creditError } = await supabase
          .from("ai_credits")
          .select("credits_remaining")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!creditError) currentBalance = creditRow?.credits_remaining ?? 0;
      }

      window.dispatchEvent(new Event("ai-credits-updated"));
      toast({
        title: "Done!",
        description: currentBalance === null
          ? `Used ${AI_COSTS[feature]} credits.`
          : `Used ${AI_COSTS[feature]} credits. ${currentBalance} left.`,
      });
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
