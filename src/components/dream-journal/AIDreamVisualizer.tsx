import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { Loader2, Palette, ArrowLeft, Download, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface AIDreamVisualizerProps {
  onBack: () => void;
}

const AIDreamVisualizer = ({ onBack }: AIDreamVisualizerProps) => {
  const { credits, spendCredit } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [dreamDescription, setDreamDescription] = useState("");
  const [artStyle, setArtStyle] = useState("surrealist");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const styles = [
    { value: "surrealist", label: "Surrealist (Dalí-inspired)" },
    { value: "watercolor", label: "Ethereal Watercolor" },
    { value: "digital-fantasy", label: "Digital Fantasy Art" },
    { value: "abstract", label: "Abstract Expressionism" },
    { value: "anime", label: "Anime / Manga Style" },
    { value: "dark-gothic", label: "Dark Gothic" },
  ];

  const handleGenerate = async () => {
    if (!dreamDescription.trim()) {
      toast.error("Please describe your dream first");
      return;
    }
    if ((credits?.credits_remaining || 0) < 3) {
      toast.error("Insufficient credits (3 required). Please purchase more.");
      return;
    }
    setLoading(true);
    try {
      const used = await spendCredit("effect", "AI Dream Visualization");
      if (!used) throw new Error("Failed to use credits");

      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("dream-ai", {
        body: { action: "visualizer", dreamDescription, artStyle },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      setGeneratedImageUrl(data.imageUrl);
      toast.success("Dream visualization created!");
    } catch (err: any) {
      toast.error(err.message || "Error generating visualization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='AIDream Visualizer'
        steps={[
          { title: 'Open the tool', desc: 'Launch the AIDream Visualizer panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              AI Dream Visualizer
              <span className="text-xs font-normal text-muted-foreground ml-auto">3 Credits per image</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Describe your dream in detail</label>
              <Textarea
                value={dreamDescription}
                onChange={(e) => setDreamDescription(e.target.value)}
                placeholder="I was flying over a crystalline ocean at sunset, with giant luminous jellyfish floating in the sky above ancient ruins..."
                className="min-h-[120px] bg-background/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Art Style</label>
              <Select value={artStyle} onValueChange={setArtStyle}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styles.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Creating Your Dream Art..." : "Generate Dream Visualization (3 Credits)"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {generatedImageUrl && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-card/80 backdrop-blur-xl border-primary/20 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Your Dream Visualization
                <a href={generatedImageUrl} download target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Download className="h-3 w-3" /> Save
                  </Button>
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={generatedImageUrl}
                alt="AI-generated dream visualization"
                className="w-full rounded-lg shadow-xl"
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};

export default AIDreamVisualizer;
