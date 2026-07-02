import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Paintbrush, Sparkles, Image as ImageIcon, Download, Brush } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const ART_STYLES = [
  { value: "van-gogh", label: "Van Gogh", desc: "Swirling post-impressionist brushstrokes", gradient: "from-amber-500 to-yellow-500" },
  { value: "manga", label: "Manga", desc: "Clean anime-style line art", gradient: "from-pink-500 to-rose-500" },
  { value: "pop-art", label: "Pop Art", desc: "Bold outlines, Ben-Day dots", gradient: "from-red-500 to-orange-500" },
  { value: "art-nouveau", label: "Art Nouveau", desc: "Flowing organic curves & borders", gradient: "from-emerald-500 to-teal-500" },
  { value: "pixel-art", label: "Pixel Art", desc: "Retro blocky geometric shapes", gradient: "from-blue-500 to-indigo-500" },
  { value: "watercolor", label: "Watercolor", desc: "Soft flowing loose outlines", gradient: "from-purple-500 to-violet-500" },
];

interface AIStyleTransferProps {
  onColorOnline?: (url: string) => void;
}

export function AIStyleTransfer({ onColorOnline }: AIStyleTransferProps) {
  const [description, setDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("van-gogh");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("coloring-ai-tools", {
        body: { action: "style-transfer", description, style: selectedStyle },
      });
      if (error) throw new Error(data?.error || error.message);
      if (data?.error) throw new Error(data.error);
      setResultImage(data.imageUrl);
      toast.success("Style transfer coloring page created!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Style Transfer - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Style Transfer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Style Transfer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-amber-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-purple-500/30 flex items-center justify-center">
              <Paintbrush className="h-5 w-5 text-primary" />
            </div>
            AI Style Transfer
            <Badge variant="secondary" className="ml-2 text-[10px]">2 CR</Badge>
          </CardTitle>
          <CardDescription>Describe a scene and choose a famous art style to generate a unique coloring page</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 space-y-5">
          {/* Style Selection */}
          <div>
            <p className="text-sm font-medium mb-3">Choose Art Style</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ART_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setSelectedStyle(style.value)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    selectedStyle === style.value
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-border/30 hover:border-primary/30"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${style.gradient} mb-1.5`} />
                  <p className="text-sm font-semibold">{style.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description Input */}
          <div className="relative">
            <Input
              placeholder="Describe your scene... (e.g., 'A majestic lion in a savanna')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12 text-base rounded-xl pr-10"
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!description.trim() || isGenerating}
            className="w-full h-12 text-base rounded-xl"
          >
            {isGenerating ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating in {ART_STYLES.find(s => s.value === selectedStyle)?.label} style...</>
            ) : (
              <><Paintbrush className="mr-2 h-5 w-5" /> Generate Style Transfer</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {resultImage && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {ART_STYLES.find(s => s.value === selectedStyle)?.label} Style Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <img src={resultImage} alt="Style transfer result" className="w-full rounded-lg max-w-md mx-auto" />
              <div className="flex gap-2 max-w-md mx-auto">
                <Button className="flex-1" onClick={() => {
                  const link = document.createElement("a");
                  link.href = resultImage;
                  link.download = `coloring-${selectedStyle}.png`;
                  link.click();
                }}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                {onColorOnline && (
                  <Button variant="outline" className="flex-1" onClick={() => onColorOnline(resultImage)}>
                    <Brush className="mr-2 h-4 w-4" /> Color Online
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
    </>
  );
}
