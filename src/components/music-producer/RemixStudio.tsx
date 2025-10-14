import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Disc3, Sparkles } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";

export const RemixStudio = () => {
  const [originalSong, setOriginalSong] = useState("");
  const [remixStyle, setRemixStyle] = useState("electronic");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const { credits, refresh } = useAICredits();

  const remixStyles = [
    "electronic", "acoustic", "orchestral", "lo-fi", 
    "jazz", "reggae", "metal", "ambient", "synthwave"
  ];

  const handleRemix = async () => {
    if (!originalSong) {
      toast.error("Please enter the original song reference");
      return;
    }

    if ((credits?.credits_remaining ?? 0) < 20) {
      toast.error("Insufficient credits. You need 20 credits for remix.");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to create remixes");
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          type: 'remix',
          originalSong,
          remixStyle,
          instructions,
        }
      });

      if (error) throw error;

      toast.success("Remix started! Check 'My Songs' tab.");
      refresh();
      
      // Reset form
      setOriginalSong("");
      setRemixStyle("electronic");
      setInstructions("");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to create remix");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Disc3 className="h-6 w-6 text-pink-500" />
          Remix Existing Song
        </h2>
        <p className="text-muted-foreground mb-6">
          Transform any song into a new remix with different style and arrangement. Cost: 20 credits
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="original">Original Song Reference</Label>
            <Input
              id="original"
              placeholder="e.g., Song title or description"
              value={originalSong}
              onChange={(e) => setOriginalSong(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Reference the song you want to remix (can be from your library or describe it)
            </p>
          </div>

          <div>
            <Label htmlFor="remix-style">Remix Style</Label>
            <Select value={remixStyle} onValueChange={setRemixStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {remixStyles.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="instructions">Remix Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="Specific changes you want in the remix..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleRemix} 
            disabled={loading || (credits?.credits_remaining ?? 0) < 20}
            className="w-full gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Creating Remix..." : "Create Remix (20 credits)"}
          </Button>

          {credits && (
            <p className="text-sm text-muted-foreground text-center">
              Remaining credits: {credits.credits_remaining}
            </p>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
        <h3 className="text-xl font-bold mb-3">Remix Features</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-pink-500 font-bold">•</span>
            <span>AI reimagines the song in your chosen style</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 font-bold">•</span>
            <span>Maintains the original melody while transforming the arrangement</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 font-bold">•</span>
            <span>Professional quality remix ready for export</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 font-bold">•</span>
            <span>Custom instructions for personalized results</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};
