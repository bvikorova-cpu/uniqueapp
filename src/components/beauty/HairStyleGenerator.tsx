import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Palette } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";

export const HairStyleGenerator = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [hairStyle, setHairStyle] = useState("blonde");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { credits, refresh } = useAICredits();

  const handleTransform = async () => {
    if (!imageUrl) {
      toast.error("Please upload an image");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to use this feature");
        return;
      }

      const { data, error } = await supabase.functions.invoke('beauty-transformation', {
        body: {
          imageUrl,
          transformationType: 'hair',
          styleApplied: hairStyle
        }
      });

      if (error) throw error;

      setResult(data.transformedImage);
      refresh();
      toast.success("Hair style applied successfully!");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to apply hair style");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Palette className="h-6 w-6 text-purple-500" />
          Hair Style Generator
        </h2>
        <p className="text-muted-foreground mb-6">
          Vyskúšaj rôzne účesy a farby vlasov. Cena: 5 kreditov
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="hair-image-url">Image URL</Label>
            <Input
              id="hair-image-url"
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="hair-style">Hair Style</Label>
            <Select value={hairStyle} onValueChange={setHairStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blonde">👱‍♀️ Blonde</SelectItem>
                <SelectItem value="brunette">👩 Brunette</SelectItem>
                <SelectItem value="red">👩‍🦰 Red/Auburn</SelectItem>
                <SelectItem value="bob">💇 Bob Cut</SelectItem>
                <SelectItem value="long">💁‍♀️ Long Hair</SelectItem>
                <SelectItem value="curly">🌊 Curly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleTransform} 
            disabled={loading || (credits?.credits_remaining ?? 0) < 5}
            className="w-full"
          >
            {loading ? "Transforming..." : "Transform Hair (5 credits)"}
          </Button>

          {credits && (
            <p className="text-sm text-muted-foreground">
              Remaining credits: {credits.credits_remaining}
            </p>
          )}
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Result</h3>
          <img 
            src={result} 
            alt="Hair transformation" 
            className="w-full rounded-lg"
          />
        </Card>
      )}
    </div>
  );
};
