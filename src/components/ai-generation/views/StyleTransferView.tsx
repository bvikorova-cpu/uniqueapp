import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brush, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface StyleTransferViewProps {
  onCreditsUsed: () => void;
}

const artStyles = [
  { name: "Van Gogh", description: "Swirling brushstrokes, vibrant post-impressionism", color: "from-yellow-500 to-blue-500" },
  { name: "Monet", description: "Soft impressionist light and water reflections", color: "from-blue-400 to-green-400" },
  { name: "Picasso", description: "Abstract cubist fragmentation and bold shapes", color: "from-red-500 to-purple-500" },
  { name: "Anime", description: "Japanese animation style, clean lines, vivid colors", color: "from-pink-500 to-purple-400" },
  { name: "Watercolor", description: "Soft washes, flowing pigments, paper texture", color: "from-cyan-400 to-blue-300" },
  { name: "Oil Painting", description: "Rich textures, classic Renaissance feel", color: "from-amber-600 to-orange-500" },
  { name: "Pop Art", description: "Bold colors, comic style, Warhol-inspired", color: "from-red-400 to-yellow-400" },
  { name: "Ukiyo-e", description: "Traditional Japanese woodblock print style", color: "from-red-600 to-rose-400" },
  { name: "Art Deco", description: "Geometric elegance, gold accents, 1920s glamour", color: "from-yellow-600 to-amber-400" },
  { name: "Pixel Art", description: "Retro 8-bit game style, nostalgic charm", color: "from-green-500 to-emerald-400" },
  { name: "Cyberpunk", description: "Neon-soaked futuristic dystopia", color: "from-purple-500 to-cyan-400" },
  { name: "Studio Ghibli", description: "Miyazaki-inspired magical realism", color: "from-green-400 to-sky-400" },
];

export const StyleTransferView = ({ onCreditsUsed }: StyleTransferViewProps) => {
  const [description, setDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!description.trim() || !selectedStyle) {
      toast.error("Please describe your image and select a style");
      return;
    }
    setLoading(true);
    setResultImage(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-tools', {
        body: { action: 'style_transfer', prompt: description, style: selectedStyle }
      });
      if (error) throw error;
      if (data.error) { toast.error(data.error); return; }
      setResultImage(data.imageUrl);
      toast.success(`Applied ${selectedStyle} style!`);
      onCreditsUsed();
    } catch (e: any) {
      toast.error(e.message || "Style transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Style Transfer View - How it works"} steps={[{ title: 'Open', desc: 'Access the Style Transfer View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Style Transfer View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Brush className="w-5 h-5 text-primary" /> AI Style Transfer</CardTitle>
          <CardDescription>Transform any concept into famous art styles — 3 credits per transfer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe the image to stylize</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. A quiet village street with a church and starry night sky..."
              className="w-full min-h-[80px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Choose an art style</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {artStyles.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setSelectedStyle(s.name)}
                  className={`text-left p-3 rounded-xl border-2 transition-all ${
                    selectedStyle === s.name
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className={`w-full h-2 rounded-full bg-gradient-to-r ${s.color} mb-2`} />
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">{s.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleTransfer} disabled={loading || !description.trim() || !selectedStyle} size="lg" className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Applying Style...</> : <><Brush className="w-4 h-4 mr-2" />Apply {selectedStyle || 'Style'} (3 credits)</>}
          </Button>

          {resultImage && (
            <div className="mt-6 border rounded-lg p-4 bg-background">
              <div className="relative group">
                <img src={resultImage} alt="Styled" className="w-full rounded-lg" />
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = resultImage;
                    link.download = `ai-styled-${selectedStyle}-${Date.now()}.webp`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
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
    </div>
    </>
  );
};
