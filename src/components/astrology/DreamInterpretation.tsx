import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAstrologyCredits, CREDIT_COSTS } from "@/hooks/useAstrologyCredits";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Moon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const DreamInterpretation = () => {
  const [dream, setDream] = useState("");
  const [result, setResult] = useState<any>(null);
  const { credits } = useAstrologyCredits();

  const interpretMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke('astrology-reading', {
        body: { type: 'dream', data: { dreamDescription: dream } }
      });
      if (error) throw error;
      await supabase.from('dream_interpretations').insert({
        user_id: user.id, dream_description: dream, interpretation: data.interpretation, credits_used: CREDIT_COSTS.dream
      });
      return data;
    },
    onSuccess: (data) => { setResult(data); toast.success("Dream decoded! 🌙"); },
    onError: (error: Error) => { toast.error(error.message); }
  });

  return (
    <>
      <FloatingHowItWorks
        title='Dream Interpretation'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Dream Interpretation panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-4">
      <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />
        <div className="flex items-center gap-2 mb-3">
          <Moon className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-black text-foreground">Dream Interpretation</h2>
          <span className="ml-auto text-xs text-muted-foreground">{CREDIT_COSTS.dream} credits</span>
        </div>
        
        <Textarea placeholder="Describe your dream in detail... What did you see, feel, experience?" value={dream} onChange={(e) => setDream(e.target.value)}
          className="min-h-32 bg-muted/30 border-border/30 mb-3" />

        <div className="flex gap-2 items-center">
          <Button onClick={() => interpretMutation.mutate()}
            disabled={interpretMutation.isPending || !dream || (credits?.credits_remaining || 0) < CREDIT_COSTS.dream}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold">
            {interpretMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Interpreting...</> : <>🌙 Interpret Dream</>}
          </Button>
          <span className="text-xs text-muted-foreground">Credits: {credits?.credits_remaining || 0}</span>
        </div>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <h3 className="text-sm font-black text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" /> Dream Analysis
            </h3>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{result.interpretation}</p>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
