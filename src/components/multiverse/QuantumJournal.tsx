import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Loader2, ArrowLeft, Save } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface QuantumJournalProps {
  onBack: () => void;
}

const QuantumJournal = ({ onBack }: QuantumJournalProps) => {
  const [entry, setEntry] = useState("");
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<{ text: string; date: string }[]>([]);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!entry.trim()) return;
    setSaving(true);
    try {
      // Save to local state (could persist to DB)
      setEntries(prev => [{ text: entry, date: new Date().toLocaleString() }, ...prev]);
      setEntry("");
      toast({ title: "Journal Entry Saved", description: "Your multiverse reflection has been recorded" });
    } finally { setSaving(false); }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Quantum Journal'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Quantum Journal panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub</Button>

      <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Quantum Journal
          </CardTitle>
          <CardDescription>Reflect on your multiverse discoveries and record insights across realities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Write about your multiverse explorations, discoveries, and reflections..."
            rows={6} className="resize-none" />
          <Button onClick={handleSave} disabled={saving || !entry.trim()} className="w-full bg-gradient-to-r from-indigo-500 to-blue-500">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Entry
          </Button>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((e, i) => (
            <Card key={i} className="border-border/30">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-2">{e.date}</p>
                <p className="text-sm">{e.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

export default QuantumJournal;
