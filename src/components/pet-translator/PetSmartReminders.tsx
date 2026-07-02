import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Syringe, Stethoscope, Apple, Pill, Calendar, Plus, Loader2, Sparkles, ArrowLeft, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const reminderTypes = [
  { id: "feeding", label: "Feeding Schedule", icon: Apple, color: "text-orange-400" },
  { id: "vaccination", label: "Vaccination", icon: Syringe, color: "text-blue-400" },
  { id: "vet_visit", label: "Vet Visit", icon: Stethoscope, color: "text-green-400" },
  { id: "medication", label: "Medication", icon: Pill, color: "text-red-400" },
  { id: "grooming", label: "Grooming", icon: Calendar, color: "text-purple-400" },
];

const mockReminders = [
  { type: "feeding", text: "Morning feeding — Max", time: "7:00 AM", active: true },
  { type: "vaccination", text: "Rabies booster due", time: "Apr 20", active: true },
  { type: "vet_visit", text: "Annual checkup", time: "May 5", active: true },
  { type: "medication", text: "Flea treatment", time: "Monthly", active: false },
];

export default function PetSmartReminders({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [form, setForm] = useState({ pet_name: "", breed: "", age: "", weight: "" });

  const getIcon = (type: string) => {
    const found = reminderTypes.find(r => r.id === type);
    return found ? found : reminderTypes[0];
  };

  const handleGenerateSchedule = async () => {
    if (!form.pet_name || !form.breed) { toast.error("Fill in pet name and breed"); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }

      const { data, error } = await supabase.functions.invoke("pet-translator-ai", {
        body: { action: "smart_reminders", ...form },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success("Smart schedule generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Pet Smart Reminders works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3">
            <Bell className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-black">⏰ Smart Pet Reminders</h2>
          <p className="text-muted-foreground text-sm">AI-powered care schedule for your pet</p>
          <Badge className="mt-2 bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Sparkles className="h-3 w-3 mr-1" /> 4 Credits
          </Badge>
        </div>

        {/* Current Reminders */}
        <Card className="bg-card/80 border-purple-500/20">
          <CardContent className="p-4 space-y-2">
            <h3 className="font-bold text-sm flex items-center gap-2 mb-3"><Clock className="h-4 w-4 text-purple-400" /> Active Reminders</h3>
            {mockReminders.map((r, i) => {
              const rt = getIcon(r.type);
              return (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border border-border/30 ${r.active ? "" : "opacity-50"}`}>
                  <rt.icon className={`h-4 w-4 ${rt.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{r.text}</p>
                    <p className="text-[10px] text-muted-foreground">{r.time}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px]">{r.active ? "Active" : "Paused"}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* AI Schedule Generator */}
        <Card className="bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border-purple-500/20">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-sm">🤖 Generate AI Care Schedule</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Pet name" value={form.pet_name} onChange={e => setForm(p => ({ ...p, pet_name: e.target.value }))} />
              <Input placeholder="Breed" value={form.breed} onChange={e => setForm(p => ({ ...p, breed: e.target.value }))} />
              <Input placeholder="Age" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} />
              <Input placeholder="Weight (kg)" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} />
            </div>
            <Button onClick={handleGenerateSchedule} disabled={loading} className="w-full bg-gradient-to-r from-amber-600 to-orange-600">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Smart Schedule</>}
            </Button>
            {result && (
              <Card className="bg-card/80 border-amber-500/20 p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
    </>
    );
}
