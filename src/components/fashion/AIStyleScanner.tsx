import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ScanLine, Upload, Camera, Sparkles, Star, Tag, Palette } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const CREDIT_COST = 8;

interface ScanResult {
  outfit_name: string;
  overall_score: number;
  style_category: string;
  color_analysis: {
    primary_colors: string[];
    harmony_score: number;
    palette_name: string;
  };
  identified_items: {
    item_name: string;
    brand_guess: string;
    estimated_price: string;
    style_rating: number;
  }[];
  fit_analysis: string;
  occasion_match: string[];
  trend_alignment: number;
  improvement_tips: string[];
  celebrity_match: string;
  season_suitability: string;
}

export default function AIStyleScanner() {
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { credits, spendCredit } = useAICredits();

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop();
      const path = `style-scanner/${session.user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("fashion").upload(path, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from("fashion").getPublicUrl(path);
      setImageUrl(publicUrl);
      toast.success("Photo uploaded!");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      for (let i = 0; i < CREDIT_COST; i++) {
        const ok = await spendCredit("custom_generation", "AI Style Scanner");
        if (!ok && i === 0) throw new Error("Insufficient credits");
      }

      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "style-scanner", imageUrl },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setResult(data.scanResult);
      toast.success("Outfit scanned!");
    },
    onError: (e: any) => toast.error(e.message || "Scan failed"),
  });

  return (
    <>
      <FloatingHowItWorks title="How AIStyle Scanner works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <ScanLine className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Style Scanner</h2>
            <p className="text-sm text-muted-foreground">Instant outfit recognition, scoring & brand detection • {CREDIT_COST} Credits</p>
          </div>
        </div>

        <div className="space-y-4">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />

          {imageUrl ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={imageUrl} alt="Outfit" className="w-full max-h-96 object-contain bg-black/20 rounded-xl" />
              <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => { setImageUrl(""); setResult(null); }}>
                Change Photo
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-primary/30 rounded-xl p-12 text-center cursor-pointer hover:border-primary/60 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold">Upload an outfit photo</p>
              <p className="text-sm text-muted-foreground mt-1">Take a photo or upload from gallery</p>
              {uploading && <Loader2 className="h-5 w-5 animate-spin mx-auto mt-3 text-primary" />}
            </div>
          )}

          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !imageUrl || (credits?.credits_remaining || 0) < CREDIT_COST}
            className="w-full gap-2"
            size="lg"
          >
            {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Scanning Outfit...</> : <><ScanLine className="h-4 w-4" /> Scan Outfit ({CREDIT_COST} Credits)</>}
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Score Card */}
            <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-primary/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-black">{result.outfit_name}</h3>
                  <p className="text-sm text-muted-foreground">{result.style_category} • {result.season_suitability}</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-primary">{result.overall_score}</div>
                  <p className="text-xs text-muted-foreground">/100</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <Palette className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Color Harmony</p>
                  <p className="font-bold">{result.color_analysis.harmony_score}/100</p>
                </div>
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <Sparkles className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Trend Score</p>
                  <p className="font-bold">{result.trend_alignment}/100</p>
                </div>
                <div className="bg-background/50 rounded-lg p-3 text-center col-span-2 sm:col-span-1">
                  <Star className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Celebrity Match</p>
                  <p className="font-bold text-sm">{result.celebrity_match}</p>
                </div>
              </div>
            </Card>

            {/* Colors */}
            <Card className="p-5 bg-card/80 border-white/10">
              <h4 className="font-bold mb-3 flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /> Color Palette: {result.color_analysis.palette_name}</h4>
              <div className="flex gap-2">
                {result.color_analysis.primary_colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1 text-xs font-medium">{c}</div>
                ))}
              </div>
            </Card>

            {/* Items */}
            <Card className="p-5 bg-card/80 border-white/10">
              <h4 className="font-bold mb-3 flex items-center gap-2"><Tag className="h-4 w-4 text-primary" /> Identified Items</h4>
              <div className="space-y-3">
                {result.identified_items.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-sm">{item.item_name}</p>
                      <p className="text-xs text-muted-foreground">{item.brand_guess} • ~{item.estimated_price}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-primary" />
                      <span className="font-bold text-sm">{item.style_rating}/10</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Fit & Occasions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-5 bg-card/80 border-white/10">
                <h4 className="font-bold mb-2">Fit Analysis</h4>
                <p className="text-sm">{result.fit_analysis}</p>
              </Card>
              <Card className="p-5 bg-card/80 border-white/10">
                <h4 className="font-bold mb-2">Best For</h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.occasion_match.map((o, i) => (
                    <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{o}</span>
                  ))}
                </div>
              </Card>
            </div>

            {/* Tips */}
            <Card className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <h4 className="font-bold mb-3">💡 Improvement Tips</h4>
              <ul className="space-y-2">
                {result.improvement_tips.map((tip, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-primary font-bold">{i + 1}.</span> {tip}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
    );
}
