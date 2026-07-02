import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Loader2, Sparkles, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  matchId: string;
}

const STYLES = [
  { value: "sports", label: "🏟️ Sports Commentator", desc: "Dramatic play-by-play" },
  { value: "esports", label: "🎮 Esports Caster", desc: "Hyped gaming commentary" },
  { value: "documentary", label: "📽️ Documentary", desc: "Calm, insightful narration" },
  { value: "comedy", label: "😂 Comedy", desc: "Hilarious observations" },
];

export const AICommentary = ({ matchId }: Props) => {
  const [style, setStyle] = useState("sports");
  const [commentary, setCommentary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  const generateCommentary = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("brain-duel-ai-commentary", {
        body: { matchId, style },
      });

      if (error) throw error;
      if (data?.error) {
        if (data.error.includes("Insufficient")) {
          toast.error("Not enough credits", { description: "You need 3 credits for AI commentary" });
        } else {
          toast.error(data.error);
        }
        return;
      }

      setCommentary(data.commentary);
      setCreditsRemaining(data.credits_remaining);
      toast.success("AI Commentary generated! 🎙️");
    } catch (e: any) {
      toast.error("Failed to generate commentary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Commentary - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Commentary section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Commentary.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-3 mt-3">
      <div className="flex items-center gap-2">
        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger className="w-48 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STYLES.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-xs">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={generateCommentary}
          disabled={loading}
          className="gap-1.5 text-xs shadow-lg shadow-primary/20"
        >
          {loading ? (
            <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
          ) : (
            <><Mic className="h-3 w-3" /> AI Commentary</>
          )}
        </Button>
        <Badge variant="outline" className="text-[10px] border-primary/30">
          <Sparkles className="h-2.5 w-2.5 mr-1" />3 credits
        </Badge>
      </div>

      <AnimatePresence>
        {commentary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-gradient-to-br from-primary/5 via-violet-500/5 to-cyan-500/5 border border-primary/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Volume2 className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-xs font-bold text-primary">
                  {STYLES.find(s => s.value === style)?.label}
                </span>
                {creditsRemaining !== null && (
                  <Badge variant="outline" className="text-[10px] ml-auto">
                    {creditsRemaining} credits left
                  </Badge>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{commentary}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};
