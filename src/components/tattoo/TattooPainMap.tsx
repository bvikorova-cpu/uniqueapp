import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const BODY_PARTS = [
  { id: "inner-wrist", label: "Inner Wrist", pain: 7, x: 18, y: 58 },
  { id: "outer-forearm", label: "Outer Forearm", pain: 4, x: 12, y: 52 },
  { id: "inner-bicep", label: "Inner Bicep", pain: 7, x: 20, y: 38 },
  { id: "outer-bicep", label: "Outer Bicep", pain: 3, x: 14, y: 35 },
  { id: "shoulder", label: "Shoulder", pain: 4, x: 22, y: 25 },
  { id: "chest", label: "Chest", pain: 6, x: 40, y: 30 },
  { id: "sternum", label: "Sternum", pain: 9, x: 50, y: 32 },
  { id: "ribcage", label: "Ribcage", pain: 9, x: 35, y: 40 },
  { id: "stomach", label: "Stomach", pain: 7, x: 45, y: 48 },
  { id: "upper-back", label: "Upper Back", pain: 5, x: 60, y: 28 },
  { id: "spine", label: "Spine", pain: 8, x: 50, y: 42 },
  { id: "lower-back", label: "Lower Back", pain: 6, x: 55, y: 52 },
  { id: "hip", label: "Hip", pain: 7, x: 35, y: 55 },
  { id: "outer-thigh", label: "Outer Thigh", pain: 3, x: 30, y: 65 },
  { id: "inner-thigh", label: "Inner Thigh", pain: 8, x: 42, y: 65 },
  { id: "knee", label: "Knee", pain: 8, x: 35, y: 72 },
  { id: "calf", label: "Calf", pain: 5, x: 32, y: 80 },
  { id: "ankle", label: "Ankle", pain: 8, x: 34, y: 90 },
  { id: "foot", label: "Foot", pain: 9, x: 36, y: 95 },
  { id: "neck", label: "Neck", pain: 8, x: 50, y: 18 },
  { id: "hand", label: "Hand", pain: 8, x: 15, y: 65 },
  { id: "elbow", label: "Elbow", pain: 8, x: 14, y: 45 },
];

const getPainColor = (pain: number) => {
  if (pain <= 3) return "bg-emerald-500";
  if (pain <= 5) return "bg-yellow-500";
  if (pain <= 7) return "bg-orange-500";
  return "bg-red-500";
};

const getPainLabel = (pain: number) => {
  if (pain <= 3) return "Low Pain";
  if (pain <= 5) return "Moderate";
  if (pain <= 7) return "High Pain";
  return "Very Painful";
};

export const TattooPainMap = ({ onBack }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<{ info: string } | null>(null);

  const selected = BODY_PARTS.find((p) => p.id === selectedPart);

  const getDetails = async (part: typeof BODY_PARTS[0]) => {
    setSelectedPart(part.id);
    if (credits.credits_remaining < 3) {
      toast.error("You need 3 credits. Redirecting...");
      setTimeout(() => navigate("/ai-credits"), 1500);
      return;
    }

    setLoading(true);
    setDetails(null);
    try {
      const { data, error } = await supabase.functions.invoke("tattoo-ai-tools", {
        body: { type: "pain_info", bodyPart: part.label, painLevel: part.pain },
      });
      if (error) throw error;
      setDetails(data);
      await refresh();
    } catch (e: any) {
      toast.error(e.message || "Error fetching details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Tattoo Pain Map - How it works"} steps={[{ title: 'Open', desc: 'Access the Tattoo Pain Map section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tattoo Pain Map.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-amber-400 hover:text-amber-300">
        <ArrowLeft className="h-4 w-4" /> Back to Atelier
      </Button>

      <Card className="p-6 max-w-4xl mx-auto bg-card/80 backdrop-blur-xl border-amber-500/20 shadow-[0_0_30px_rgba(212,175,55,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Pain Map</h2>
            <p className="text-muted-foreground text-sm">Detailed pain levels for every body part</p>
          </div>
          <span className="ml-auto text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">3 Credits/lookup</span>
        </motion.div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          {[
            { label: "Low (1-3)", color: "bg-emerald-500" },
            { label: "Moderate (4-5)", color: "bg-yellow-500" },
            { label: "High (6-7)", color: "bg-orange-500" },
            { label: "Very Painful (8-10)", color: "bg-red-500" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className={`w-3 h-3 rounded-full ${l.color}`} />
              {l.label}
            </div>
          ))}
        </div>

        {/* Body Part Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {BODY_PARTS.map((part) => (
            <motion.button
              key={part.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => getDetails(part)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedPart === part.id
                  ? "border-amber-500/50 bg-amber-500/10 shadow-lg"
                  : "border-amber-500/10 hover:border-amber-500/30 hover:bg-amber-500/5"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${getPainColor(part.pain)}`} />
                <span className="text-xs font-bold">{part.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black">{part.pain}/10</span>
                <span className="text-[10px] text-muted-foreground">{getPainLabel(part.pain)}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Details */}
        {selected && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-5 bg-gradient-to-br from-amber-500/5 to-yellow-600/5 border-amber-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-5 h-5 rounded-full ${getPainColor(selected.pain)}`} />
                <h3 className="font-black text-lg">{selected.label}</h3>
                <span className="text-sm font-bold text-amber-400">{selected.pain}/10 — {getPainLabel(selected.pain)}</span>
              </div>
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing pain profile...
                </div>
              ) : details ? (
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">{details.info}</div>
              ) : null}
            </Card>
          </motion.div>
        )}
      </Card>
    </div>
    </>
  );
};
