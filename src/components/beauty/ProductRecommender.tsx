import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const ProductRecommender = () => {
  const [skinType, setSkinType] = useState("normal");
  const [hairType, setHairType] = useState("straight");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { credits, refresh } = useAICredits();

  const concernOptions = ["Acne", "Dry skin", "Oily skin", "Aging", "Dark circles", "Frizzy hair", "Hair loss"];

  const toggleConcern = (concern: string) => {
    setConcerns(prev => 
      prev.includes(concern) 
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    );
  };

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to use this feature");
        return;
      }

      const { data, error } = await supabase.functions.invoke('beauty-recommendations', {
        body: { skinType, hairType, concerns }
      });

      if (error) throw error;

      setRecommendations(data.recommendations);
      refresh();
      toast.success("Recommendations generated!");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Product Recommender works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-green-500" />
          Beauty Product Recommender
        </h2>
        <p className="text-muted-foreground mb-6">
          Get personalized product recommendations. Cost: 3 credits
        </p>

        <div className="space-y-4">
          <div>
            <Label>Skin Type</Label>
            <Select value={skinType} onValueChange={setSkinType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="dry">Dry</SelectItem>
                <SelectItem value="oily">Oily</SelectItem>
                <SelectItem value="combination">Combination</SelectItem>
                <SelectItem value="sensitive">Sensitive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Hair Type</Label>
            <Select value={hairType} onValueChange={setHairType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="straight">Straight</SelectItem>
                <SelectItem value="wavy">Wavy</SelectItem>
                <SelectItem value="curly">Curly</SelectItem>
                <SelectItem value="coily">Coily</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-3 block">Concerns</Label>
            <div className="grid grid-cols-2 gap-3">
              {concernOptions.map(concern => (
                <div key={concern} className="flex items-center gap-2">
                  <Checkbox
                    checked={concerns.includes(concern)}
                    onCheckedChange={() => toggleConcern(concern)}
                  />
                  <span className="text-sm">{concern}</span>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleGetRecommendations} 
            disabled={loading || (credits?.credits_remaining ?? 0) < 3}
            className="w-full"
          >
            {loading ? "Generating..." : "Get Recommendations (3 credits)"}
          </Button>

          {credits && (
            <p className="text-sm text-muted-foreground">
              Remaining credits: {credits.credits_remaining}
            </p>
          )}
        </div>
      </Card>

      {recommendations && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Your Personalized Recommendations</h3>
          
          {recommendations.skincare && recommendations.skincare.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">💧 Skincare</h4>
              <ul className="space-y-2">
                {recommendations.skincare.map((product: any, i: number) => (
                  <li key={i} className="text-sm">
                    <strong>{product.name}</strong> ({product.type}) - {product.why}
                    <span className="text-muted-foreground ml-2">{product.priceRange}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendations.haircare && recommendations.haircare.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">💆 Haircare</h4>
              <ul className="space-y-2">
                {recommendations.haircare.map((product: any, i: number) => (
                  <li key={i} className="text-sm">
                    <strong>{product.name}</strong> ({product.type}) - {product.why}
                    <span className="text-muted-foreground ml-2">{product.priceRange}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendations.makeup && recommendations.makeup.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">💄 Makeup</h4>
              <ul className="space-y-2">
                {recommendations.makeup.map((product: any, i: number) => (
                  <li key={i} className="text-sm">
                    <strong>{product.name}</strong> ({product.type}) - {product.why}
                    <span className="text-muted-foreground ml-2">{product.priceRange}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendations.tips && recommendations.tips.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">✨ Pro Tips</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {recommendations.tips.map((tip: string, i: number) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
    </>
    );
};
