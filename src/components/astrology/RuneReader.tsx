import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAstrologyCredits, CREDIT_COSTS } from "@/hooks/useAstrologyCredits";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const RUNE_SYMBOLS = ["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ","ᚹ","ᚺ","ᚾ","ᛁ","ᛃ","ᛇ","ᛈ","ᛉ","ᛊ","ᛏ","ᛒ","ᛖ","ᛗ","ᛚ","ᛜ","ᛟ","ᛞ"];

export const RuneReader = () => {
  const [result, setResult] = useState<any>(null);
  const [runeSymbol, setRuneSymbol] = useState("");
  const { credits } = useAstrologyCredits();

  const drawMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      setRuneSymbol(RUNE_SYMBOLS[Math.floor(Math.random() * RUNE_SYMBOLS.length)]);
      const { data, error } = await supabase.functions.invoke('astrology-reading', {
        body: { type: 'rune', data: {} }
      });
      if (error) throw error;
      await supabase.from('rune_readings').insert({
        user_id: user.id, rune_name: data.runeName, rune_meaning: data.runeMeaning, guidance: data.guidance, credits_used: CREDIT_COSTS.rune
      });
      return data;
    },
    onSuccess: (data) => { setResult(data); toast.success("Rune revealed! 🗿"); },
    onError: (error: Error) => { toast.error(error.message); }
  });

  return (
    <>
      <FloatingHowItWorks
        title='Rune Reader'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Rune Reader panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-4">
      <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500" />
        <div className="flex items-center gap-2 mb-3">
          <Flame className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-black text-foreground">Rune Reading</h2>
          <span className="ml-auto text-xs text-muted-foreground">{CREDIT_COSTS.rune} credit</span>
        </div>

        {!result ? (
          <div className="text-center py-6">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center border border-indigo-500/30">
              <span className="text-4xl font-bold text-indigo-500">ᚱ</span>
            </motion.div>
            <p className="text-xs text-muted-foreground mb-4">Draw a rune for ancient Norse wisdom and guidance</p>
            <Button onClick={() => drawMutation.mutate()}
              disabled={drawMutation.isPending || (credits?.credits_remaining || 0) < CREDIT_COSTS.rune}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold">
              {drawMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Drawing...</> : <>🗿 Draw Rune</>}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Credits: {credits?.credits_remaining || 0}</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 150 }}
              className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <span className="text-5xl text-white">{runeSymbol}</span>
            </motion.div>
            <div>
              <h3 className="text-xl font-black text-foreground">{result.runeName}</h3>
              <p className="text-sm text-muted-foreground">{result.runeMeaning}</p>
            </div>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap text-left">{result.guidance}</p>
            <Button variant="outline" onClick={() => { setResult(null); setRuneSymbol(""); }} className="border-border/30">Draw Another</Button>
          </motion.div>
        )}
      </Card>
    </div>
    </>
  );
};
