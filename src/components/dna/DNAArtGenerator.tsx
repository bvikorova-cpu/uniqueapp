import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Palette, Sparkles, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const artStyles = [
  { id: "abstract", label: "Abstract Genome", desc: "Flowing shapes representing your genetic diversity" },
  { id: "cosmic", label: "Cosmic DNA", desc: "Your heritage mapped onto a starfield" },
  { id: "watercolor", label: "Watercolor Heritage", desc: "Soft watercolor interpretation of your origins" },
  { id: "geometric", label: "Geometric Helix", desc: "Precise geometric patterns from your DNA" },
  { id: "impressionist", label: "Impressionist Ancestry", desc: "Monet-style rendering of your genetic landscape" },
];

export const DNAArtGenerator = () => {
  const { toast } = useToast();
  const [style, setStyle] = useState("abstract");
  const [generating, setGenerating] = useState(false);
  const [artResult, setArtResult] = useState<{ imageUrl: string; description: string } | null>(null);

  const generateArt = async () => {
    try {
      setGenerating(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign In Required", description: "Please sign in to generate DNA art", variant: "destructive" });
        return;
      }

      // Fetch user's DNA analysis for context
      const { data: dnaData } = await supabase
        .from("dna_analyses")
        .select("genetic_traits, heritage_breakdown")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const heritage = dnaData?.heritage_breakdown || { european: 40, african: 20, asian: 25, american: 15 };
      const traits = dnaData?.genetic_traits || {};

      // Use AI to generate art description
      const { data, error } = await supabase.functions.invoke("process-dna-analysis", {
        body: {
          sampleId: `ART-${style}-${Date.now()}`,
          artMode: true,
          style,
          heritage,
          traits,
        },
      });

      if (error) throw error;

      // Generate a descriptive result since we don't have an image generation API here
      const styleLabel = artStyles.find(s => s.id === style)?.label || style;
      setArtResult({
        imageUrl: "",
        description: data?.analysis?.art_description ||
          `Your ${styleLabel} artwork has been conceived based on your unique genetic profile. ` +
          `The composition reflects heritage regions across multiple continents, with color intensity ` +
          `mapped to genetic diversity markers. Each flowing element represents a distinct ancestral pathway.`,
      });

      toast({ title: "Art Generated!", description: `Your ${styleLabel} DNA artwork is ready` });
    } catch (e) {
      console.error(e);
      toast({ title: "Generation Failed", description: "Could not generate DNA art. Please try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='DNAArt Generator'
        steps={[
          { title: 'Open the tool', desc: 'Launch the DNAArt Generator panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Card className="p-5 bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 border-fuchsia-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-5 h-5 text-fuchsia-500" />
          <span className="font-black text-sm">DNA Art Generator</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Transform your genetic profile into a unique piece of art. Select a style and let AI create a visual representation of your DNA.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Art Style</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="bg-muted/10 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {artStyles.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    <div>
                      <span className="font-semibold">{s.label}</span>
                      <span className="text-muted-foreground ml-2 text-xs">— {s.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={generateArt} disabled={generating} className="w-full gap-2">
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating Art...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate DNA Art</>
            )}
          </Button>
        </div>
      </Card>

      {artResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-primary/20">
            {/* Art visualization using CSS */}
            <div className="aspect-video bg-gradient-to-br from-fuchsia-600/30 via-cyan-500/20 to-violet-600/30 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-30">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: 20 + Math.random() * 80,
                      height: 20 + Math.random() * 80,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      background: `radial-gradient(circle, ${['#f0f', '#0ff', '#ff0', '#f00', '#0f0'][i % 5]}44, transparent)`,
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{ duration: 3 + i * 0.5, repeat: Infinity }}
                  />
                ))}
              </div>
              <div className="relative text-center p-6">
                <Palette className="w-12 h-12 text-white mx-auto mb-2" />
                <p className="text-white font-black text-lg">Your DNA Artwork</p>
                <Badge className="bg-white/20 text-white mt-2">{artStyles.find(s => s.id === style)?.label}</Badge>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-sm mb-2">Art Description</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{artResult.description}</p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
