import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const VirtualTryOn = () => {
  const [photoUrl, setPhotoUrl] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const { credits } = useAICredits();

  const tryOnMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('virtual-tryon', {
        body: {
          photoUrl,
          itemDescription
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setResult(data.result);
      toast.success('Virtual try-on complete!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate try-on');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    tryOnMutation.mutate();
  };

  return (
    <>
      <FloatingHowItWorks title="How Virtual Try On works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Virtual Try-On</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Upload your photo and describe an item to see how it looks on you. Costs 10 credits.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="photo">Photo URL</Label>
            <Input
              id="photo"
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Paste a URL to your photo
            </p>
          </div>

          <div>
            <Label htmlFor="item">Item Description</Label>
            <Textarea
              id="item"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="E.g., blue denim jacket with silver buttons"
              rows={3}
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={tryOnMutation.isPending || (credits?.credits_remaining || 0) < 10}
            className="w-full gap-2"
          >
            {tryOnMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Try-On...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Virtual Try-On (10 credits)
              </>
            )}
          </Button>

          {credits && credits.credits_remaining < 10 && (
            <p className="text-sm text-destructive">
              Insufficient credits. You have {credits.credits_remaining} credits remaining.
            </p>
          )}
        </form>
      </Card>

      {result && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Try-On Result</h3>
          <img 
            src={result} 
            alt="Virtual try-on result" 
            className="w-full rounded-lg"
          />
        </Card>
      )}
    </div>
    </>
    );
};