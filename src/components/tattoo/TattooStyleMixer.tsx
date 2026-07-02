import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Blend, Loader2, Sparkles, Download, Gem } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const STYLES = [
  "Realistic", "Tribal", "Watercolor", "Geometric", "Blackwork",
  "Traditional", "Japanese", "Minimalist", "Neo-Traditional", "Dotwork",
  "Biomechanical", "Chicano", "Sketch", "Surrealist"
];

interface Props { onBack: () => void; }

export const TattooStyleMixer = ({ onBack }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [style1, setStyle1] = useState("");
  const [style2, setStyle2] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const mix = async () => {
    if (!style1 || !style2 || !description) {
      toast.error("Select two styles and describe your tattoo");
      return;
    }
    if (credits.credits_remaining < 12) {
      toast.error("You need 12 credits. Redirecting...");
      setTimeout(() => navigate("/ai-credits"), 1500);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tattoo-ai-tools", {
        body: { type: "style_mix", style1, style2, description },
      });
      if (error) throw error;
      setResult(data.imageUrl);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("ai_tattoo_designs").insert({
          user_id: user.id,
          prompt: `Style Mix: ${style1} + ${style2} - ${description}`,
          style: `${style1}-${style2}`,
          design_url: data.imageUrl,
          credits_used: 12,
        });
      }
      await refresh();
      toast.success("Style mix generated!");
    } catch (e: any) {
      toast.error(e.message || "Error mixing styles");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Tattoo Style Mixer - How it works"} steps={[{ title: 'Open', desc: 'Access the Tattoo Style Mixer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tattoo Style Mixer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-amber-400 hover:text-amber-300">
        <ArrowLeft className="h-4 w-4" /> Back to Atelier
      </Button>

      <Card className="p-6 max-w-3xl mx-auto bg-card/80 backdrop-blur-xl border-amber-500/20 shadow-[0_0_30px_rgba(212,175,55,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Blend className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Style Mixer</h2>
            <p className="text-muted-foreground text-sm">Blend two tattoo styles into one masterpiece</p>
          </div>
          <span className="ml-auto text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">12 Credits</span>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {[
            { label: "Style 1", selected: style1, setter: setStyle1, disabled: "" },
            { label: "Style 2", selected: style2, setter: setStyle2, disabled: style1 },
          ].map((col, ci) => (
            <motion.div key={col.label} initial={{ opacity: 0, x: ci === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Label className="text-amber-400/80 font-semibold mb-2 block">{col.label} {col.selected && <span className="text-xs text-foreground/60">— {col.selected}</span>}</Label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={col.selected === s ? "default" : "outline"}
                    onClick={() => col.setter(s)}
                    disabled={s === col.disabled}
                    className={`text-xs transition-all duration-200 ${
                      col.selected === s
                        ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold shadow-lg shadow-amber-500/20 scale-105"
                        : "border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5"
                    }`}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
          <Label className="text-amber-400/80 font-semibold">Describe Your Tattoo</Label>
          <Textarea
            placeholder="e.g., A lion with a crown surrounded by roses, epic composition..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-2 border-amber-500/20 focus:border-amber-500/50 bg-background/50"
          />
        </motion.div>

        <Button onClick={mix} disabled={loading} className="w-full gap-2 h-12 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold text-base shadow-lg shadow-amber-500/20">
          {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Mixing Styles...</> : <><Sparkles className="h-5 w-5" /> Mix Styles — 12 Credits</>}
        </Button>

        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 space-y-4">
            <img src={result} alt="Mixed tattoo" className="w-full rounded-xl border-2 border-amber-500/30 shadow-2xl shadow-amber-500/10" />
            <Button variant="outline" className="w-full gap-2 border-amber-500/30 hover:bg-amber-500/10" onClick={() => {
              const link = document.createElement("a");
              link.href = result;
              link.download = `tattoo-mix-${Date.now()}.png`;
              link.click();
            }}>
              <Download className="h-4 w-4" /> Download Design
            </Button>
          </motion.div>
        )}
      </Card>
    </div>
    </>
  );
};
