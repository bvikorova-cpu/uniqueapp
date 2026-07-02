import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, Loader2, Sparkles, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const TattooAgingSimulator = ({ onBack }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [tattooImage, setTattooImage] = useState<string | null>(null);
  const [years, setYears] = useState("5");
  const [skinType, setSkinType] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ analysis: string; agedImageUrl?: string } | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setTattooImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const simulate = async () => {
    if (!tattooImage) {
      toast.error("Upload a tattoo image first");
      return;
    }
    if (credits.credits_remaining < 10) {
      toast.error("You need 10 credits. Redirecting...");
      setTimeout(() => navigate("/ai-credits"), 1500);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tattoo-ai-tools", {
        body: { type: "aging_simulation", imageUrl: tattooImage, years: parseInt(years), skinType },
      });
      if (error) throw error;
      setResult(data);
      await refresh();
      toast.success("Aging simulation complete!");
    } catch (e: any) {
      toast.error(e.message || "Error simulating aging");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Tattoo Aging Simulator - How it works"} steps={[{ title: 'Open', desc: 'Access the Tattoo Aging Simulator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tattoo Aging Simulator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-amber-400 hover:text-amber-300">
        <ArrowLeft className="h-4 w-4" /> Back to Atelier
      </Button>

      <Card className="p-6 max-w-3xl mx-auto bg-card/80 backdrop-blur-xl border-amber-500/20 shadow-[0_0_30px_rgba(212,175,55,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Aging Simulator</h2>
            <p className="text-muted-foreground text-sm">See how your tattoo evolves over decades</p>
          </div>
          <span className="ml-auto text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">10 Credits</span>
        </motion.div>

        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Label className="text-amber-400/80 font-semibold">Upload Tattoo Image or Design</Label>
            <div
              className="mt-2 border-2 border-dashed border-amber-500/20 rounded-xl p-8 text-center cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300"
              onClick={() => document.getElementById("aging-upload")?.click()}
            >
              {tattooImage ? (
                <img src={tattooImage} alt="Tattoo" className="max-h-64 mx-auto rounded-lg shadow-lg" />
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto text-amber-500/30 mb-3" />
                  <p className="text-muted-foreground font-medium">Click to upload tattoo image</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, WebP supported</p>
                </>
              )}
              <input id="aging-upload" type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-amber-400/80 font-semibold">Years Forward</Label>
              <Select value={years} onValueChange={setYears}>
                <SelectTrigger className="border-amber-500/20 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20, 30].map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y} Years</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-amber-400/80 font-semibold">Skin Type</Label>
              <Select value={skinType} onValueChange={setSkinType}>
                <SelectTrigger className="border-amber-500/20 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="olive">Olive</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          <Button
            onClick={simulate}
            disabled={loading || !tattooImage}
            className="w-full gap-2 h-12 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold text-base shadow-lg shadow-amber-500/20"
          >
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Simulating...</> : <><Sparkles className="h-5 w-5" /> Simulate Aging — 10 Credits</>}
          </Button>

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5 mt-2 bg-gradient-to-br from-amber-500/5 to-yellow-600/5 border-amber-500/20">
                <h3 className="font-black text-lg mb-3 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  Aging Analysis — {years} Years
                </h3>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">
                  {result.analysis}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
    </>
  );
};
