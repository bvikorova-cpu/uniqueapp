import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAstrologyCredits, CREDIT_COSTS } from "@/hooks/useAstrologyCredits";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Hand } from "lucide-react";

export const PalmistryReader = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const { credits } = useAstrologyCredits();

  const readMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");

      const { data, error } = await supabase.functions.invoke('astrology-reading', {
        body: {
          type: 'palmistry',
          data: { imageUrl }
        }
      });

      if (error) throw error;

      await supabase.from('palmistry_readings').insert({
        user_id: user.id,
        image_url: imageUrl,
        reading: data.reading,
        credits_used: CREDIT_COSTS.palmistry
      });

      return data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Palm read successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Hand className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Palmistry Reading</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Upload a clear photo of your palm for a detailed chiromancy reading. Cost: {CREDIT_COSTS.palmistry} credits
        </p>
        
        <Input
          type="url"
          placeholder="Paste image URL of your palm..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="mb-4"
        />

        {imageUrl && (
          <img src={imageUrl} alt="Palm" className="max-w-md mx-auto rounded-lg mb-4" />
        )}

        <div className="flex gap-2 items-center">
          <Button
            onClick={() => readMutation.mutate()}
            disabled={readMutation.isPending || !imageUrl || (credits?.credits_remaining || 0) < CREDIT_COSTS.palmistry}
          >
            {readMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reading Palm...
              </>
            ) : (
              `Read Palm (${CREDIT_COSTS.palmistry} credits)`
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            Credits available: {credits?.credits_remaining || 0}
          </span>
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Your Palmistry Reading</h3>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{result.reading}</p>
          </div>
        </Card>
      )}
    </div>
  );
};
