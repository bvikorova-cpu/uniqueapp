import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GenerateViewProps {
  onCreditsUsed: () => void;
}

const examplePrompts = [
  "A majestic lion with a galaxy mane, cosmic background, digital art, vibrant colors",
  "Cozy coffee shop interior, rainy day outside, warm lighting, watercolor painting style",
  "Futuristic city skyline at night, neon lights, cyberpunk aesthetic, 4K detailed",
  "Enchanted forest with glowing mushrooms, fairy tale atmosphere, magical lighting",
  "Vintage sports car on mountain road, sunset, photorealistic, golden hour",
  "Abstract geometric patterns with gold and marble textures, luxury design",
];

export const GenerateView = ({ onCreditsUsed }: GenerateViewProps) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Please enter a description"); return; }
    setLoading(true);
    setGeneratedImage(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-tools', {
        body: { action: 'generate', prompt }
      });
      if (error) throw error;
      if (data.error) { toast.error(data.error); return; }
      setGeneratedImage(data.imageUrl);
      toast.success("Image generated successfully!");
      onCreditsUsed();
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Custom AI Generation
          </CardTitle>
          <CardDescription>Create a completely new image using AI — 5 credits per image</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create in detail..."
            className="w-full min-h-[120px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
          <Button onClick={handleGenerate} disabled={loading || !prompt.trim()} size="lg" className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Wand2 className="w-4 h-4 mr-2" />Generate Image (5 credits)</>}
          </Button>

          {generatedImage && (
            <div className="mt-6 border rounded-lg p-4 bg-background">
              <div className="relative group">
                <img src={generatedImage} alt="Generated" className="w-full rounded-lg" />
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = generatedImage;
                    link.download = `ai-generated-${Date.now()}.webp`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success("Downloading image!");
                  }}
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />Download
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Example Prompts</CardTitle>
          <CardDescription>Click any to use as your prompt</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {examplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => setPrompt(p)}
                className="text-left p-3 rounded-lg border bg-background hover:bg-primary/5 hover:border-primary/30 transition-colors text-sm text-muted-foreground"
              >
                "{p}"
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
