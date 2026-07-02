import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAstrologyCredits, CREDIT_COSTS } from "@/hooks/useAstrologyCredits";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Hand, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const PalmistryReader = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const { credits } = useAstrologyCredits();

  const readMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke('astrology-reading', {
        body: { type: 'palmistry', data: { imageUrl } }
      });
      if (error) throw error;
      await supabase.from('palmistry_readings').insert({ user_id: user.id, image_url: imageUrl, reading: data.reading, credits_used: CREDIT_COSTS.palmistry });
      return data;
    },
    onSuccess: (data) => { setResult(data); toast.success("Palm decoded! 🖐️"); },
    onError: (error: Error) => { toast.error(error.message); }
  });

  return (
    <>
      <FloatingHowItWorks
        title='Palmistry Reader'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Palmistry Reader panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-4">
      <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500" />
        <div className="flex items-center gap-2 mb-3">
          <Hand className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-black text-foreground">Palmistry Reading</h2>
          <span className="ml-auto text-xs text-muted-foreground">{CREDIT_COSTS.palmistry} credits</span>
        </div>
        
        <Input type="url" placeholder="Paste image URL of your palm..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mb-3 bg-muted/30 border-border/30" />
        {imageUrl && <img src={imageUrl} alt="Palm" className="max-w-xs mx-auto rounded-xl mb-3 border border-border/30" />}

        <div className="flex gap-2 items-center">
          <Button onClick={() => readMutation.mutate()}
            disabled={readMutation.isPending || !imageUrl || (credits?.credits_remaining || 0) < CREDIT_COSTS.palmistry}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold">
            {readMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reading...</> : <>🖐️ Read Palm</>}
          </Button>
          <span className="text-xs text-muted-foreground">Credits: {credits?.credits_remaining || 0}</span>
        </div>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
            <h3 className="text-sm font-black text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" /> Palm Analysis
            </h3>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{result.reading}</p>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
