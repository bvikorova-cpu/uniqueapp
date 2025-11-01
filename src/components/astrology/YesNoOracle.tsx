import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAstrologyCredits, CREDIT_COSTS } from "@/hooks/useAstrologyCredits";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, HelpCircle } from "lucide-react";

export const YesNoOracle = () => {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const { credits } = useAstrologyCredits();

  const askMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");

      const { data, error } = await supabase.functions.invoke('astrology-reading', {
        body: {
          type: 'yes_no',
          data: { question }
        }
      });

      if (error) throw error;

      await supabase.from('universe_questions').insert({
        user_id: user.id,
        question,
        answer: data.answer,
        explanation: data.explanation,
        credits_used: CREDIT_COSTS.yes_no
      });

      return data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Answer received!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Yes/No Oracle</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Ask the universe a yes or no question. Cost: {CREDIT_COSTS.yes_no} credits
        </p>
        
        <Input
          placeholder="Ask your yes/no question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mb-4"
        />

        <div className="flex gap-2 items-center">
          <Button
            onClick={() => askMutation.mutate()}
            disabled={askMutation.isPending || !question || (credits?.credits_remaining || 0) < CREDIT_COSTS.yes_no}
          >
            {askMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Consulting...
              </>
            ) : (
              `Ask Oracle (${CREDIT_COSTS.yes_no} credits)`
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            Credits available: {credits?.credits_remaining || 0}
          </span>
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          <h3 className="text-3xl font-bold text-center mb-4">
            {result.answer}
          </h3>
          <p className="text-center text-muted-foreground">{result.explanation}</p>
        </Card>
      )}
    </div>
  );
};
