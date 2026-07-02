import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Package, Loader2 } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const CapsuleWardrobe = () => {
  const [lifestyle, setLifestyle] = useState("");
  const [budget, setBudget] = useState("");
  const [result, setResult] = useState<any>(null);
  const { credits } = useAICredits();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data: wardrobeItems } = await supabase
        .from('wardrobe_items')
        .select('name, category, color');

      const { data, error } = await supabase.functions.invoke('capsule-wardrobe', {
        body: {
          lifestyle,
          budget,
          currentWardrobe: wardrobeItems || []
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setResult(data.capsulePlan);
      toast.success('Capsule wardrobe plan generated!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate plan');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate();
  };

  return (
    <>
      <FloatingHowItWorks title="How Capsule Wardrobe works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Capsule Wardrobe Builder</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Get a personalized capsule wardrobe plan based on your lifestyle. Costs 15 credits.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="lifestyle">Lifestyle Description</Label>
            <Textarea
              id="lifestyle"
              value={lifestyle}
              onChange={(e) => setLifestyle(e.target.value)}
              placeholder="E.g., I work in an office, love weekend brunches, and travel frequently"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="budget">Budget Range</Label>
            <Input
              id="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="E.g., €500-1000"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={generateMutation.isPending || (credits?.credits_remaining || 0) < 15}
            className="w-full gap-2"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Package className="h-4 w-4" />
                Generate Capsule Plan (15 credits)
              </>
            )}
          </Button>

          {credits && credits.credits_remaining < 15 && (
            <p className="text-sm text-destructive">
              Insufficient credits. You have {credits.credits_remaining} credits remaining.
            </p>
          )}
        </form>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Your Capsule Wardrobe Plan</h3>
            
            {result.essential_pieces && result.essential_pieces.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Essential Pieces</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {result.essential_pieces.map((piece: any, idx: number) => (
                    <li key={idx}>{typeof piece === 'string' ? piece : piece.description}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.color_palette && result.color_palette.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Color Palette</h4>
                <div className="flex gap-2 flex-wrap">
                  {result.color_palette.map((color: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.mix_match_combos && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Possible Combinations</h4>
                <p className="text-sm">You can create <span className="font-bold text-primary">{result.mix_match_combos}</span> different outfits!</p>
              </div>
            )}

            {result.styling_guide && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Styling Guide</h4>
                <p className="text-sm whitespace-pre-line">{result.styling_guide}</p>
              </div>
            )}

            {result.shopping_list && result.shopping_list.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Shopping List</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {result.shopping_list.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
    </>
    );
};