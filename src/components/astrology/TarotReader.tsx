import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const TAROT_CARDS = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World"
];

const CARD_EMOJIS: Record<string, string> = {
  "The Fool": "🃏", "The Magician": "🎩", "The High Priestess": "🌙", "The Empress": "👑",
  "The Emperor": "🏛️", "The Hierophant": "📿", "The Lovers": "💕", "The Chariot": "🏇",
  "Strength": "🦁", "The Hermit": "🏮", "Wheel of Fortune": "🎡", "Justice": "⚖️",
  "The Hanged Man": "🙃", "Death": "💀", "Temperance": "🏺", "The Devil": "😈",
  "The Tower": "🗼", "The Star": "⭐", "The Moon": "🌕", "The Sun": "☀️",
  "Judgement": "📯", "The World": "🌍"
};

export const TarotReader = () => {
  const [question, setQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const drawCards = () => {
    setIsFlipping(true);
    setResult(null);
    setTimeout(() => {
      const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
      setDrawnCards(shuffled.slice(0, 3));
      setIsFlipping(false);
    }, 800);
  };

  const readingMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cards = drawnCards.map((card, idx) => ({ card, position: ['past', 'present', 'future'][idx] }));
      const { data, error } = await supabase.functions.invoke('astrology-reading', {
        body: { type: 'tarot', data: { cards, question, readingType: 'general' } }
      });
      if (error) throw error;
      await supabase.from('tarot_readings').insert([{
        user_id: user.id, question: question || null, cards: JSON.stringify(cards),
        interpretation: data.interpretation, reading_type: 'general' as const, is_premium: false
      }]);
      return data;
    },
    onSuccess: (data) => { setResult(data); toast.success('Cards have spoken! ✨'); },
    onError: (error: any) => { toast.error(error.message || 'Failed to read cards'); }
  });

  const positions = ["Past", "Present", "Future"];
  const posGradients = ["from-blue-500 to-cyan-400", "from-purple-500 to-violet-400", "from-amber-500 to-yellow-400"];

  return (
    <>
      <FloatingHowItWorks
        title='Tarot Reader'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Tarot Reader panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-4">
      <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-bold text-foreground">Your Question (Optional)</Label>
            <Textarea placeholder="What would you like guidance on?" value={question} onChange={(e) => setQuestion(e.target.value)} className="min-h-[80px] bg-muted/30 border-border/30 mt-1" />
          </div>

          {drawnCards.length === 0 ? (
            <motion.div whileHover={{ scale: 1.02 }} className="text-center py-6">
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}
                className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-amber-500/20 flex items-center justify-center border border-purple-500/30">
                <span className="text-4xl">🃏</span>
              </motion.div>
              <Button onClick={drawCards} className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-bold">
                <Sparkles className="mr-2 h-4 w-4" /> Draw Three Cards
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {drawnCards.map((card, idx) => (
                  <motion.div key={idx} initial={{ rotateY: 180, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.2, type: "spring", stiffness: 100 }}>
                    <Card className="p-3 text-center bg-muted/30 border-border/30 relative overflow-hidden">
                      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${posGradients[idx]}`} />
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{positions[idx]}</p>
                      <span className="text-2xl block mb-1">{CARD_EMOJIS[card] || "🃏"}</span>
                      <p className="text-xs font-bold text-foreground leading-tight">{card}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => readingMutation.mutate()} disabled={readingMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold">
                  {readingMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Reading...</> : <>✨ Interpret Cards</>}
                </Button>
                <Button variant="outline" onClick={drawCards} className="border-border/30">Redraw</Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-amber-500" />
            <h4 className="text-sm font-black text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" /> Your Reading
            </h4>
            {question && (
              <div className="p-3 bg-muted/30 rounded-xl border border-border/30">
                <p className="text-[10px] text-muted-foreground mb-0.5">Question:</p>
                <p className="text-sm font-medium text-foreground">{question}</p>
              </div>
            )}
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{result.interpretation}</p>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
