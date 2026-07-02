import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles, Heart } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const OutfitRecommender = () => {
  const [occasion, setOccasion] = useState("casual");
  const [season, setSeason] = useState("all_season");
  const { credits } = useAICredits();
  const queryClient = useQueryClient();

  const { data: recommendations } = useQuery({
    queryKey: ['outfit-recommendations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outfit_recommendations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('outfit-recommender', {
        body: {
          occasion,
          season,
          preferences: {}
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfit-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      toast.success('Outfit recommendation generated!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate recommendation');
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from('outfit_recommendations')
        .update({ is_favorite: !isFavorite })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfit-recommendations'] });
    }
  });

  return (
    <>
      <FloatingHowItWorks title="How Outfit Recommender works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">Get Outfit Recommendations</h2>
        <p className="text-sm text-muted-foreground">
          Generate personalized outfit suggestions based on your wardrobe. Costs 5 credits.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Occasion</Label>
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="party">Party</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Season</Label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spring">Spring</SelectItem>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="fall">Fall</SelectItem>
                <SelectItem value="winter">Winter</SelectItem>
                <SelectItem value="all_season">All Season</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={() => generateMutation.mutate()} 
          disabled={generateMutation.isPending || (credits?.credits_remaining || 0) < 5}
          className="w-full gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {generateMutation.isPending ? 'Generating...' : 'Generate Outfit (5 credits)'}
        </Button>

        {credits && credits.credits_remaining < 5 && (
          <p className="text-sm text-destructive">
            Insufficient credits. You have {credits.credits_remaining} credits remaining.
          </p>
        )}
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Recommendations</h3>
        
        {recommendations?.map((rec) => (
          <Card key={rec.id} className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium capitalize bg-primary/10 px-3 py-1 rounded-full">
                    {rec.occasion}
                  </span>
                  <span className="text-sm text-muted-foreground capitalize">
                    {rec.season}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(rec.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFavoriteMutation.mutate({ id: rec.id, isFavorite: rec.is_favorite })}
              >
                <Heart className={`h-5 w-5 ${rec.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Outfit Description</h4>
              <p className="text-sm">{rec.ai_description}</p>
            </div>

            {rec.styling_tips && (
              <div className="space-y-2 border-t pt-4">
                <h4 className="font-semibold">Styling Tips</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{rec.styling_tips}</p>
              </div>
            )}
          </Card>
        ))}

        {(!recommendations || recommendations.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No outfit recommendations yet.</p>
            <p className="text-sm">Generate your first recommendation above!</p>
          </div>
        )}
      </div>
    </div>
    </>
    );
};