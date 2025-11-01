import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAstrologyCredits, CREDIT_COSTS } from "@/hooks/useAstrologyCredits";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Moon } from "lucide-react";

export const DreamInterpretation = () => {
  const [dream, setDream] = useState("");
  const [result, setResult] = useState<any>(null);
  const { credits } = useAstrologyCredits();

  const interpretMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");

      const { data, error } = await supabase.functions.invoke('astrology-reading', {
        body: {
          type: 'dream',
          data: { dreamDescription: dream }
        }
      });

      if (error) throw error;

      await supabase.from('dream_interpretations').insert({
        user_id: user.id,
        dream_description: dream,
        interpretation: data.interpretation,
        credits_used: CREDIT_COSTS.dream
      });

      return data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Dream interpreted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Moon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Dream Interpretation</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Describe your dream and receive a psychological and symbolic interpretation. Cost: {CREDIT_COSTS.dream} credits
        </p>
        
        <Textarea
          placeholder="Describe your dream in detail..."
          value={dream}
          onChange={(e) => setDream(e.target.value)}
          className="min-h-32 mb-4"
        />

        <div className="flex gap-2 items-center">
          <Button
            onClick={() => interpretMutation.mutate()}
            disabled={interpretMutation.isPending || !dream || (credits?.credits_remaining || 0) < CREDIT_COSTS.dream}
          >
            {interpretMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Interpreting...
              </>
            ) : (
              `Interpret Dream (${CREDIT_COSTS.dream} credits)`
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            Credits available: {credits?.credits_remaining || 0}
          </span>
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Your Dream Interpretation</h3>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{result.interpretation}</p>
          </div>
        </Card>
      )}
    </div>
  );
};
