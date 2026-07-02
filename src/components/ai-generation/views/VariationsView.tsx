import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onCreditsUsed: () => void; }

export const VariationsView = ({ onCreditsUsed }: Props) => {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return toast.error("Enter a prompt first");
    setLoading(true);
    try {
      const results: string[] = [];
      for (let i = 0; i < 4; i++) {
        const { data, error } = await supabase.functions.invoke("ai-image-tools", {
          body: { action: "variations", prompt: prompt.trim(), variationIndex: i },
        });
        if (error) throw error;
        if (data?.imageUrl) results.push(data.imageUrl);
      }
      setImages(results);
      onCreditsUsed();
      toast.success(`Generated ${results.length} variations!`);
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Variations View - How it works"} steps={[{ title: 'Open', desc: 'Access the Variations View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Variations View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-2">🎨 AI Image Variations</h2>
        <p className="text-muted-foreground text-sm">Generate 4 unique variations from a single prompt. Cost: 8 CR total (2 CR each)</p>
      </div>

      <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your image concept..." rows={3} className="resize-none" />
      
      <Button onClick={generate} disabled={loading || !prompt.trim()} className="w-full gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
        {loading ? "Generating 4 Variations..." : "Generate 4 Variations (8 CR)"}
      </Button>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {images.map((img, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="relative group rounded-xl overflow-hidden border border-border">
              <img src={img} alt={`Variation ${i + 1}`} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <a href={img} download={`variation-${i + 1}.webp`}>
                  <Button size="sm" variant="secondary" className="gap-1"><Download className="w-3 h-3" /> Download</Button>
                </a>
              </div>
              <span className="absolute top-2 left-2 text-xs font-bold bg-black/60 text-white px-2 py-0.5 rounded-full">V{i + 1}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};
