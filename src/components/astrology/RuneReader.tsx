import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAstrologyCredits, CREDIT_COSTS } from "@/hooks/useAstrologyCredits";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export const RuneReader = () => {
  const [result, setResult] = useState<any>(null);
  const { credits } = useAstrologyCredits();

  const drawMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");

      const { data, error } = await supabase.functions.invoke('astrology-reading', {
        body: {
          type: 'rune',
          data: {}
        }
      });

      if (error) throw error;

      await supabase.from('rune_readings').insert({
        user_id: user.id,
        rune_name: data.runeName,
        rune_meaning: data.runeMeaning,
        guidance: data.guidance,
        credits_used: CREDIT_COSTS.rune
      });

      return data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Rune drawn successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Daily Rune</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Draw your daily rune for guidance and wisdom. Cost: {CREDIT_COSTS.rune} credit
        </p>

        <div className="flex gap-2 items-center">
          <Button
            onClick={() => drawMutation.mutate()}
            disabled={drawMutation.isPending || (credits?.credits_remaining || 0) < CREDIT_COSTS.rune}
          >
            {drawMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Drawing Rune...
              </>
            ) : (
              `Draw Rune (${CREDIT_COSTS.rune} credit)`
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            Credits available: {credits?.credits_remaining || 0}
          </span>
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          <h3 className="text-2xl font-bold text-center mb-2">
            {result.runeName}
          </h3>
          <p className="text-center text-muted-foreground mb-4">{result.runeMeaning}</p>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{result.guidance}</p>
          </div>
        </Card>
      )}
    </div>
  );
};
