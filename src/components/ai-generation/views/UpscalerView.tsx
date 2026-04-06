import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpscalerViewProps {
  onCreditsUsed: () => void;
}

const sizes = [
  { label: "Square HD (1024x1024)", value: "1024x1024" },
  { label: "Landscape HD (1792x1024)", value: "1792x1024" },
  { label: "Portrait HD (1024x1792)", value: "1024x1792" },
];

export const UpscalerView = ({ onCreditsUsed }: UpscalerViewProps) => {
  const [description, setDescription] = useState("");
  const [targetSize, setTargetSize] = useState("1024x1024");
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleUpscale = async () => {
    if (!description.trim()) { toast.error("Please describe the image to enhance"); return; }
    setLoading(true);
    setResultImage(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-tools', {
        body: { action: 'upscale', prompt: description, targetSize }
      });
      if (error) throw error;
      if (data.error) { toast.error(data.error); return; }
      setResultImage(data.imageUrl);
      toast.success("Image enhanced to HD!");
      onCreditsUsed();
    } catch (e: any) {
      toast.error(e.message || "Upscale failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ArrowUpRight className="w-5 h-5 text-primary" /> AI Image Upscaler</CardTitle>
          <CardDescription>Enhance & upscale images to stunning HD quality — 2 credits per upscale</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe the image to enhance</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. A low-resolution photo of a mountain landscape at sunset..."
              className="w-full min-h-[100px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target resolution</label>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setTargetSize(s.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    targetSize === s.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <p className="text-sm font-semibold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label.split(' (')[0]}</p>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleUpscale} disabled={loading || !description.trim()} size="lg" className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enhancing...</> : <><ArrowUpRight className="w-4 h-4 mr-2" />Upscale to HD (2 credits)</>}
          </Button>

          {resultImage && (
            <div className="mt-6 border rounded-lg p-4 bg-background">
              <div className="relative group">
                <img src={resultImage} alt="Upscaled" className="w-full rounded-lg" />
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = resultImage;
                    link.download = `ai-upscaled-${Date.now()}.webp`;
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
  );
};
