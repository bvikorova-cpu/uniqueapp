import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Loader2, Heart, Wind, Brain, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const ANXIETY_SYMPTOMS = [
  { id: "racing_heart", label: "Racing Heart", icon: Heart, color: "text-red-400" },
  { id: "sweating", label: "Sweating", icon: Activity, color: "text-orange-400" },
  { id: "breathing", label: "Shortness of Breath", icon: Wind, color: "text-blue-400" },
  { id: "racing_thoughts", label: "Racing Thoughts", icon: Brain, color: "text-purple-400" },
  { id: "trembling", label: "Trembling", icon: Zap, color: "text-yellow-400" },
  { id: "nausea", label: "Nausea", icon: Activity, color: "text-green-400" },
];

const GROUNDING_STEPS = [
  { step: 5, sense: "things you can SEE", emoji: "👁️" },
  { step: 4, sense: "things you can TOUCH", emoji: "🤚" },
  { step: 3, sense: "things you can HEAR", emoji: "👂" },
  { step: 2, sense: "things you can SMELL", emoji: "👃" },
  { step: 1, sense: "thing you can TASTE", emoji: "👅" },
];

export const AnxietyTracker = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [showGrounding, setShowGrounding] = useState(false);
  const [currentGroundingStep, setCurrentGroundingStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const logAnxiety = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }
      const { error } = await supabase.from("ai_generated_content").insert({
        user_id: session.user.id,
        content_type: "social_post" as any,
        title: `anxiety_log_${Date.now()}`,
        prompt: `Anxiety level: ${anxietyLevel}/10`,
        generated_text: `Symptoms: ${Array.from(selectedSymptoms).join(", ")}`,
        metadata: { anxiety_level: anxietyLevel, symptoms: Array.from(selectedSymptoms), type: "anxiety_log" },
        status: "completed" as any,
      });
      if (error) throw error;
      toast.success("Anxiety episode logged!");
      setSelectedSymptoms(new Set());
      setAnxietyLevel(5);
    } catch (e) { toast.error("Failed to log"); console.error(e); }
    finally { setSaving(false); }
  };

  if (showGrounding) {
    const step = GROUNDING_STEPS[currentGroundingStep];
    return (
    <>
      <FloatingHowItWorks title={"Anxiety Tracker - How it works"} steps={[{ title: 'Open', desc: 'Access the Anxiety Tracker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Anxiety Tracker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => { setShowGrounding(false); setCurrentGroundingStep(0); }}>← Back</Button>
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50 text-center">
          <h3 className="font-black text-lg mb-2">5-4-3-2-1 Grounding</h3>
          <p className="text-xs text-muted-foreground mb-6">Focus on your surroundings to bring you back to the present</p>
          
          <div className="flex gap-1 mb-6 justify-center">
            {GROUNDING_STEPS.map((_, i) => (
              <div key={i} className={`w-8 h-2 rounded-full ${i <= currentGroundingStep ? "bg-cyan-500" : "bg-muted/30"}`} />
            ))}
          </div>

          <div className="text-6xl mb-4">{step.emoji}</div>
          <p className="text-2xl font-black text-cyan-400 mb-2">Name {step.step}</p>
          <p className="text-sm text-muted-foreground mb-8">{step.sense}</p>

          <Button onClick={() => {
            if (currentGroundingStep >= 4) {
              toast.success("🌟 Grounding exercise complete! How do you feel?");
              setShowGrounding(false);
              setCurrentGroundingStep(0);
            } else {
              setCurrentGroundingStep(prev => prev + 1);
            }
          }} className="w-full">
            {currentGroundingStep >= 4 ? "Complete ✓" : "Next →"}
          </Button>
        </Card>
      </div>
    </>
  );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-cyan-400" />
          <h3 className="font-bold">Anxiety Episode Tracker</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Current Anxiety Level: {anxietyLevel}/10</label>
            <input type="range" min={1} max={10} value={anxietyLevel} onChange={e => setAnxietyLevel(Number(e.target.value))}
              className="w-full accent-cyan-500" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Select Symptoms</label>
            <div className="grid grid-cols-2 gap-2">
              {ANXIETY_SYMPTOMS.map(s => (
                <button key={s.id} onClick={() => toggleSymptom(s.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-left text-sm transition-all ${
                    selectedSymptoms.has(s.id) ? "bg-cyan-500/10 border-cyan-500/30" : "border-border/50 bg-muted/10"
                  }`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                  <span className="text-xs">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={logAnxiety} disabled={saving} className="flex-1">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Log Episode
            </Button>
            <Button onClick={() => setShowGrounding(true)} variant="outline" className="flex-1">
              🧘 Grounding Exercise
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
