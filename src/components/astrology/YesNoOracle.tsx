import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAstrologyCredits, CREDIT_COSTS } from "@/hooks/useAstrologyCredits";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, HelpCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const YesNoOracle = () => {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const { credits } = useAstrologyCredits();

  const askMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke('astrology-reading', {
        body: { type: 'yes_no', data: { question } }
      });
      if (error) throw error;
      await supabase.from('universe_questions').insert({
        user_id: user.id, question, answer: data.answer, explanation: data.explanation, credits_used: CREDIT_COSTS.yes_no
      });
      return data;
    },
    onSuccess: (data) => { setResult(data); toast.success("The universe has spoken! ✨"); },
    onError: (error: Error) => { toast.error(error.message); }
  });

  const answerColor = result?.answer?.toLowerCase() === 'yes' ? 'from-emerald-500 to-green-400'
    : result?.answer?.toLowerCase() === 'no' ? 'from-red-500 to-rose-400' : 'from-amber-500 to-yellow-400';

  return (
    <>
      <FloatingHowItWorks
        title='Yes No Oracle'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Yes No Oracle panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-4">
      <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-black text-foreground">Yes/No Oracle</h2>
          <span className="ml-auto text-xs text-muted-foreground">{CREDIT_COSTS.yes_no} credits</span>
        </div>
        
        <Input placeholder="Ask your yes or no question..." value={question} onChange={(e) => setQuestion(e.target.value)} className="mb-3 bg-muted/30 border-border/30" />

        <div className="flex gap-2 items-center">
          <Button onClick={() => askMutation.mutate()}
            disabled={askMutation.isPending || !question || (credits?.credits_remaining || 0) < CREDIT_COSTS.yes_no}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold">
            {askMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Consulting...</> : <>❓ Ask Oracle</>}
          </Button>
          <span className="text-xs text-muted-foreground">Credits: {credits?.credits_remaining || 0}</span>
        </div>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }}>
          <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${answerColor}`} />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${answerColor} flex items-center justify-center shadow-xl mb-4`}>
              <span className="text-3xl font-black text-white uppercase">{result.answer}</span>
            </motion.div>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.explanation}</p>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
