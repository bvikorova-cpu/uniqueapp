import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const WOUND_TYPES = [
  { id: "laceration", label: "🔪 Laceration", desc: "Deep cut or tear in the skin" },
  { id: "abrasion", label: "🩹 Abrasion", desc: "Scrape or graze on the surface" },
  { id: "puncture", label: "📌 Puncture Wound", desc: "Small deep hole from sharp object" },
  { id: "burn_1st", label: "🔥 1st Degree Burn", desc: "Red, painful, no blisters" },
  { id: "burn_2nd", label: "🔥 2nd Degree Burn", desc: "Blisters, swelling, severe pain" },
  { id: "burn_3rd", label: "🔥 3rd Degree Burn", desc: "White/charred, numbness" },
  { id: "bruise", label: "💜 Deep Bruise / Contusion", desc: "Internal bleeding under skin" },
  { id: "sprain", label: "🦶 Sprain / Strain", desc: "Ligament or muscle injury" },
  { id: "fracture_open", label: "🦴 Open Fracture", desc: "Bone protruding through skin" },
  { id: "insect_bite", label: "🐝 Insect Bite / Sting", desc: "Bee, wasp, spider, tick bite" },
  { id: "animal_bite", label: "🐕 Animal Bite", desc: "Dog, cat, or wild animal bite" },
  { id: "nosebleed", label: "🩸 Nosebleed", desc: "Bleeding from the nose" },
];

export const AIWoundGuide = ({ onBack }: Props) => {
  const [selectedWound, setSelectedWound] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { spendCredit } = useAICredits();

  const analyzeWound = async (woundId: string) => {
    const ok = await spendCredit("custom_generation", "Wound Guide Analysis");
    if (!ok) { toast({ title: "Insufficient Credits", variant: "destructive" }); return; }

    setSelectedWound(woundId);
    setLoading(true);

    try {
      const wound = WOUND_TYPES.find(w => w.id === woundId);
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          recipientName: wound?.label || woundId,
          senderName: "wound_guide",
          message: `You are an expert first aid wound care specialist. Provide a comprehensive visual identification and treatment guide for: "${wound?.label} - ${wound?.desc}"

Include ALL of these sections:

🔍 VISUAL IDENTIFICATION:
- What it looks like (color, texture, shape, size indicators)
- Key distinguishing features from similar wounds
- Severity indicators (mild, moderate, severe)

⚠️ DANGER SIGNS (seek immediate medical help if):
- List specific warning signs

🩹 STEP-BY-STEP TREATMENT:
1-8 numbered treatment steps with clear instructions

💊 RECOMMENDED SUPPLIES:
- List specific first aid supplies needed

🔄 HEALING TIMELINE:
- Expected recovery time by severity
- Signs of proper vs improper healing

❌ COMMON MISTAKES TO AVOID:
- List what NOT to do

🏥 WHEN TO SEE A DOCTOR:
- Specific criteria for professional care`,
        },
      });
      if (error) throw error;
      setAnalysis(data?.message || data?.analysis || "Analysis unavailable.");
    } catch (e) {
      console.error(e);
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Wound Guide - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Wound Guide section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Wound Guide.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Badge className="bg-red-100 text-red-700">3 Credits</Badge>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3">
          <Eye className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">AI Wound Guide</h2>
        <p className="text-muted-foreground">Visual identification & detailed treatment protocols</p>
      </div>

      {!selectedWound && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WOUND_TYPES.map(w => (
            <Card key={w.id} className="cursor-pointer hover:scale-[1.02] transition-all hover:border-cyan-300" onClick={() => analyzeWound(w.id)}>
              <CardContent className="py-3 flex items-center gap-3">
                <span className="text-2xl">{w.label.split(" ")[0]}</span>
                <div>
                  <p className="font-semibold text-sm">{w.label.substring(w.label.indexOf(" ") + 1)}</p>
                  <p className="text-xs text-muted-foreground">{w.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {loading && (
        <Card><CardContent className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-500" /><p>Analyzing wound type...</p></CardContent></Card>
      )}

      {analysis && !loading && (
        <div className="space-y-4">
          <Card className="border-cyan-200">
            <CardHeader><CardTitle>{WOUND_TYPES.find(w => w.id === selectedWound)?.label}</CardTitle></CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">{analysis}</div>
            </CardContent>
          </Card>
          <Button variant="outline" className="w-full" onClick={() => { setSelectedWound(null); setAnalysis(null); }}>Analyze Another Wound Type</Button>
        </div>
      )}
    </div>
    </>
  );
};
