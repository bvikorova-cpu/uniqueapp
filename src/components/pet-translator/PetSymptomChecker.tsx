import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, AlertTriangle, Loader2, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { usePetProfiles } from "@/hooks/usePetProfiles";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const SYMPTOMS = [
  "Vomiting","Diarrhea","Loss of appetite","Lethargy","Coughing","Sneezing","Limping","Itching/scratching",
  "Excessive thirst","Frequent urination","Bad breath","Weight loss","Eye discharge","Seizures","Difficulty breathing",
];

export default function PetSymptomChecker({ onBack }: { onBack: () => void }) {
  const { active } = usePetProfiles();
  const [selected, setSelected] = useState<string[]>([]);
  const [duration, setDuration] = useState("");
  const [result, setResult] = useState("");
  const [urgency, setUrgency] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (s: string) => setSelected((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

  const handle = async () => {
    if (selected.length === 0) return toast.error("Select at least one symptom");
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("pet-translator-ai", {
      body: { action: "symptom_check", symptoms: selected, duration, species: active?.species, breed: active?.breed, age: active?.age_years },
    });
    setLoading(false);
    if (error || data?.error) return toast.error(error?.message || data.error);
    const text: string = data.result || "";
    setResult(text);
    const m = text.match(/🔴|🟡|🟢/);
    setUrgency(m?.[0] || null);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("pet_symptoms_log").insert({ user_id: user.id, pet_id: active?.id, symptoms: selected, ai_assessment: text, urgency: m?.[0] });
  };

  return (
    <>
      <FloatingHowItWorks title="How Pet Symptom Checker works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <Card className="p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><Stethoscope className="w-5 h-5 text-primary" /> Symptom Checker</h2>
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> AI guidance only — not a vet replacement.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {SYMPTOMS.map((s) => (
            <button key={s} type="button" onClick={() => toggle(s)}
              className={`px-3 py-1.5 rounded-full border text-sm transition-all ${selected.includes(s) ? "bg-primary text-primary-foreground border-primary" : "border-border/40"}`}>
              {s}
            </button>
          ))}
        </div>
        <Input placeholder="Duration (e.g., 2 days)" value={duration} onChange={(e) => setDuration(e.target.value)} className="mb-3" />
        <Button onClick={handle} disabled={loading} className="w-full">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Checking…</> : "Check (5 credits)"}
        </Button>
      </Card>
      {result && (
        <Card className="p-6">
          {urgency && <div className="text-2xl mb-2">{urgency} Urgency</div>}
          <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
        </Card>
      )}
    </div>
    </>
    );
}
