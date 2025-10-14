import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const TAROT_CARDS = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World"
];

export const TarotReader = () => {
  const [question, setQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  const drawCards = () => {
    const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
    setDrawnCards(shuffled.slice(0, 3));
  };

  const readingMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const cards = drawnCards.map((card, idx) => ({
        card,
        position: ['past', 'present', 'future'][idx]
      }));

      const { data, error } = await supabase.functions.invoke('astrology-reading', {
        body: {
          type: 'tarot',
          data: {
            cards,
            question,
            readingType: 'general'
          }
        }
      });

      if (error) throw error;

      const tarotData = {
        user_id: user.id,
        question: question || null,
        cards: JSON.stringify(cards),
        interpretation: data.interpretation,
        reading_type: 'general' as const,
        is_premium: false
      };

      await supabase.from('tarot_readings').insert([tarotData]);
      return data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success('Tarot reading complete!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to read cards');
    }
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="text-xl font-semibold">Three Card Tarot Reading</h3>
          </div>

          <div>
            <Label htmlFor="question">Your Question (Optional)</Label>
            <Textarea
              id="question"
              placeholder="What would you like guidance on?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {drawnCards.length === 0 ? (
            <Button onClick={drawCards} className="w-full">
              Draw Cards
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {drawnCards.map((card, idx) => (
                  <Card key={idx} className="p-4 text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <p className="text-xs text-muted-foreground mb-2">
                      {['Past', 'Present', 'Future'][idx]}
                    </p>
                    <p className="font-semibold">{card}</p>
                  </Card>
                ))}
              </div>

              <Button
                onClick={() => readingMutation.mutate()}
                disabled={readingMutation.isPending}
                className="w-full"
              >
                {readingMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Reading the cards...</>
                ) : (
                  <>Get Interpretation</>
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {result && (
        <Card className="p-6 space-y-4">
          <h4 className="font-semibold text-lg">Your Reading</h4>
          {question && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Question:</p>
              <p className="font-medium">{question}</p>
            </div>
          )}
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{result.interpretation}</p>
          </div>
        </Card>
      )}
    </div>
  );
};
