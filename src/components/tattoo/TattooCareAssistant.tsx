import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const TattooCareAssistant = ({ onBack }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [stage, setStage] = useState("fresh");
  const [concerns, setConcerns] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ guide: string } | null>(null);

  const getGuide = async () => {
    if (credits.credits_remaining < 5) {
      toast.error("You need 5 credits. Redirecting...");
      setTimeout(() => navigate("/ai-credits"), 1500);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tattoo-ai-tools", {
        body: { type: "care_guide", healingStage: stage, concerns },
      });
      if (error) throw error;
      setResult(data);
      await refresh();
      toast.success("Care guide generated!");
    } catch (e: any) {
      toast.error(e.message || "Error generating guide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Tattoo Care Assistant - How it works"} steps={[{ title: 'Open', desc: 'Access the Tattoo Care Assistant section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tattoo Care Assistant.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-amber-400 hover:text-amber-300">
        <ArrowLeft className="h-4 w-4" /> Back to Atelier
      </Button>

      <Card className="p-6 max-w-3xl mx-auto bg-card/80 backdrop-blur-xl border-amber-500/20 shadow-[0_0_30px_rgba(212,175,55,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-lime-500 flex items-center justify-center shadow-lg shadow-green-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">Care Assistant</h2>
            <p className="text-muted-foreground text-sm">AI-powered healing guide & aftercare checklist</p>
          </div>
          <span className="ml-auto text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">5 Credits</span>
        </motion.div>

        <div className="space-y-4">
          <div>
            <Label className="text-amber-400/80 font-semibold">Healing Stage</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="border-amber-500/20 mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fresh">Just Got Inked (Day 1-3)</SelectItem>
                <SelectItem value="peeling">Peeling Phase (Day 4-14)</SelectItem>
                <SelectItem value="healing">Healing Phase (Week 2-4)</SelectItem>
                <SelectItem value="healed">Fully Healed (1+ month)</SelectItem>
                <SelectItem value="old">Old Tattoo (6+ months)</SelectItem>
                <SelectItem value="touchup">Pre Touch-Up Prep</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-amber-400/80 font-semibold">Specific Concerns (Optional)</Label>
            <Textarea placeholder="e.g., slight redness around edges, itching, color seems dull, sun exposure questions..." value={concerns} onChange={(e) => setConcerns(e.target.value)} rows={3} className="mt-1 border-amber-500/20 focus:border-amber-500/50 bg-background/50" />
          </div>

          <Button onClick={getGuide} disabled={loading} className="w-full gap-2 h-12 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold text-base shadow-lg shadow-amber-500/20">
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Generating Guide...</> : <><Sparkles className="h-5 w-5" /> Get Care Guide — 5 Credits</>}
          </Button>

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5 mt-2 bg-gradient-to-br from-amber-500/5 to-yellow-600/5 border-amber-500/20">
                <h3 className="font-black text-lg mb-3 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">Your Personalized Care Guide</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">{result.guide}</div>
              </Card>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
    </>
  );
};
