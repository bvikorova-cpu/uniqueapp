import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Palette, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const TattooColorPalette = ({ onBack }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [skinTone, setSkinTone] = useState("medium");
  const [tattooDesc, setTattooDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ palette: string } | null>(null);

  const generate = async () => {
    if (!tattooDesc) { toast.error("Describe your tattoo idea"); return; }
    if (credits.credits_remaining < 6) {
      toast.error("You need 6 credits. Redirecting...");
      setTimeout(() => navigate("/ai-credits"), 1500);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tattoo-ai-tools", {
        body: { type: "color_palette", skinTone, description: tattooDesc },
      });
      if (error) throw error;
      setResult(data);
      await refresh();
      toast.success("Color palette generated!");
    } catch (e: any) {
      toast.error(e.message || "Error generating palette");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Tattoo Color Palette - How it works"} steps={[{ title: 'Open', desc: 'Access the Tattoo Color Palette section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tattoo Color Palette.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-amber-400 hover:text-amber-300">
        <ArrowLeft className="h-4 w-4" /> Back to Atelier
      </Button>

      <Card className="p-6 max-w-3xl mx-auto bg-card/80 backdrop-blur-xl border-amber-500/20 shadow-[0_0_30px_rgba(212,175,55,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Palette className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Color Palette AI</h2>
            <p className="text-muted-foreground text-sm">Perfect ink colors matched to your skin tone</p>
          </div>
          <span className="ml-auto text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">6 Credits</span>
        </motion.div>

        <div className="space-y-4">
          <div>
            <Label className="text-amber-400/80 font-semibold">Your Skin Tone</Label>
            <Select value={skinTone} onValueChange={setSkinTone}>
              <SelectTrigger className="border-amber-500/20 mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="very-fair">Very Fair (Type I)</SelectItem>
                <SelectItem value="fair">Fair (Type II)</SelectItem>
                <SelectItem value="medium">Medium (Type III)</SelectItem>
                <SelectItem value="olive">Olive (Type IV)</SelectItem>
                <SelectItem value="brown">Brown (Type V)</SelectItem>
                <SelectItem value="dark">Dark (Type VI)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-amber-400/80 font-semibold">Describe Your Tattoo Idea</Label>
            <Textarea placeholder="e.g., A watercolor butterfly on my forearm with floral elements..." value={tattooDesc} onChange={(e) => setTattooDesc(e.target.value)} rows={3} className="mt-1 border-amber-500/20 focus:border-amber-500/50 bg-background/50" />
          </div>

          <Button onClick={generate} disabled={loading} className="w-full gap-2 h-12 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold text-base shadow-lg shadow-amber-500/20">
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Generating Palette...</> : <><Sparkles className="h-5 w-5" /> Generate Palette — 6 Credits</>}
          </Button>

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5 mt-2 bg-gradient-to-br from-amber-500/5 to-yellow-600/5 border-amber-500/20">
                <h3 className="font-black text-lg mb-3 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">Your Custom Color Palette</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">{result.palette}</div>
              </Card>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
    </>
  );
};
