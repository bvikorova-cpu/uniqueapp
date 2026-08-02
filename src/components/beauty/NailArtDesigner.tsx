import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Paintbrush, ArrowLeft, Clock, Star } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface NailArtDesignerProps {
  onBack: () => void;
}

export const NailArtDesigner = ({ onBack }: NailArtDesignerProps) => {
  const [style, setStyle] = useState("french");
  const [occasion, setOccasion] = useState("everyday");
  const [shape, setShape] = useState("almond");
  const [image, setImage] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const { credits, refresh } = useAICredits();

  const handleDesign = async () => {
    setLoading(true);
    setImage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }

      const prompt = `Ultra realistic close-up photograph of a manicured female hand showing a ${style} nail art design on ${shape}-shaped nails, styled for a ${occasion} occasion. Professional salon quality, glossy finish, detailed nail art on all five nails, soft studio lighting, clean neutral background, macro beauty photography.`;

      const { data, error } = await supabase.functions.invoke('ai-image-tools', {
        body: { action: 'generate', feature: 'beauty_nail_art', prompt, aspectRatio: '1:1' }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const url = data?.imageUrl || data?.imageUrls?.[0];
      if (!url) throw new Error("No design image returned. Please try again.");

      setImage(url);
      refresh();
      toast.success("Nail design created!");
    } catch (error: any) {
      toast.error(error.message || "Design failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (image) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [image]);


  return (
    <>
      <FloatingHowItWorks title="How Nail Art Designer works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-pink-500/20">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Paintbrush className="h-6 w-6 text-pink-500" />
            AI Nail Art Designer
          </h2>
          <p className="text-muted-foreground mb-6">Generate custom nail art designs for any occasion • 3 Credits</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="french">💅 French</SelectItem>
                  <SelectItem value="geometric">🔷 Geometric</SelectItem>
                  <SelectItem value="floral">🌸 Floral</SelectItem>
                  <SelectItem value="abstract">🎨 Abstract</SelectItem>
                  <SelectItem value="minimalist">✨ Minimalist</SelectItem>
                  <SelectItem value="glitter">💎 Glitter Glam</SelectItem>
                  <SelectItem value="marble">🪨 Marble</SelectItem>
                  <SelectItem value="ombre">🌅 Ombre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Occasion</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyday">Daily Wear</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="party">Party</SelectItem>
                  <SelectItem value="date">Date Night</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nail Shape</Label>
              <Select value={shape} onValueChange={setShape}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="almond">Almond</SelectItem>
                  <SelectItem value="oval">Oval</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="coffin">Coffin/Ballerina</SelectItem>
                  <SelectItem value="stiletto">Stiletto</SelectItem>
                  <SelectItem value="round">Round</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleDesign} disabled={loading || (credits?.credits_remaining ?? 0) < 3} className="w-full mt-4">
            {loading ? "Designing..." : "Generate Design (3 Credits)"}
          </Button>
          {credits && <p className="text-sm text-muted-foreground mt-2">Credits: {credits.credits_remaining}</p>}
        </Card>
      </motion.div>

      <div ref={resultRef} />

      {image && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4 bg-card/80 backdrop-blur-xl border-pink-500/20 space-y-4">
            <h3 className="text-lg font-bold">💅 Your Nail Design</h3>
            <img
              src={image}
              alt={`AI generated ${style} nail art design on ${shape} nails for ${occasion}`}
              className="w-full rounded-xl border border-border"
              loading="lazy"
            />
            <Button
              variant="secondary"
              className="w-full gap-2"
              onClick={() => downloadImage(image, `nail-art-${style}-${Date.now()}.png`)}
            >
              <Download className="h-4 w-4" /> Download design
            </Button>
          </Card>
        </motion.div>
      )}

    </div>
    </>
    );
};
