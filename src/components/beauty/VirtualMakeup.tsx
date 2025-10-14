import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Upload } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";

export const VirtualMakeup = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [makeupStyle, setMakeupStyle] = useState("glam");
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
          transformationType: 'makeup',
          styleApplied: makeupStyle
        }
      });

      if (error) throw error;

      setResult(data.transformedImage);
      refresh();
      toast.success("Makeup applied successfully!");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to apply makeup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-pink-500" />
          Virtual Makeup Try-On
        </h2>
        <p className="text-muted-foreground mb-6">
          Nahraj selfie a AI aplikuje rôzne make-up looky. Cena: 5 kreditov
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="makeup-style">Makeup Style</Label>
            <Select value={makeupStyle} onValueChange={setMakeupStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="glam">💄 Glam (Dramatic)</SelectItem>
                <SelectItem value="natural">🌸 Natural (Fresh)</SelectItem>
                <SelectItem value="smokey">🖤 Smokey Eyes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleTransform} 
            disabled={loading || (credits?.credits_remaining ?? 0) < 5}
            className="w-full"
          >
            {loading ? "Applying makeup..." : "Apply Makeup (5 credits)"}
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
            alt="Makeup transformation" 
            className="w-full rounded-lg"
          />
        </Card>
      )}
    </div>
  );
};
