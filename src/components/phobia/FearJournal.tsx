import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Loader2, Calendar, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface JournalEntry {
  id: string;
  title: string;
  generated_text: string | null;
  prompt: string;
  created_at: string;
  metadata: any;
}

export const FearJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [situation, setSituation] = useState("");
  const [fearLevel, setFearLevel] = useState(5);
  const [thoughts, setThoughts] = useState("");
  const [copingUsed, setCopingUsed] = useState("");

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase
        .from("ai_generated_content")
        .select("id, title, generated_text, prompt, created_at, metadata")
        .eq("user_id", session.user.id)
        .eq("content_type", "social_post")
        .like("title", "fear_journal_%")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      setEntries(data || []);
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  };

  const saveEntry = async () => {
    if (!situation.trim()) { toast.error("Describe the situation"); return; }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }
      const { error } = await supabase.from("ai_generated_content").insert({
        user_id: session.user.id,
        content_type: "social_post" as any,
        title: `fear_journal_${Date.now()}`,
        prompt: situation,
        generated_text: thoughts || null,
        metadata: { fear_level: fearLevel, coping_used: copingUsed, type: "fear_journal" },
        status: "completed" as any,
      });
      if (error) throw error;
      toast.success("Journal entry saved!");
      setSituation(""); setThoughts(""); setCopingUsed(""); setFearLevel(5);
      loadEntries();
    } catch (e: any) { toast.error("Failed to save"); console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Fear Journal - How it works"} steps={[{ title: 'Open', desc: 'Access the Fear Journal section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Fear Journal.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-cyan-400" />
          <h3 className="font-bold text-lg">New Fear Journal Entry</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Situation / Trigger</label>
            <Textarea value={situation} onChange={e => setSituation(e.target.value)}
              placeholder="Describe the situation that triggered your fear..." rows={3} className="bg-muted/10 border-border/50" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Fear Intensity: {fearLevel}/10</label>
            <input type="range" min={1} max={10} value={fearLevel} onChange={e => setFearLevel(Number(e.target.value))}
              className="w-full accent-cyan-500" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Mild</span><span>Moderate</span><span>Severe</span><span>Extreme</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Thoughts & Feelings</label>
            <Textarea value={thoughts} onChange={e => setThoughts(e.target.value)}
              placeholder="What went through your mind?" rows={2} className="bg-muted/10 border-border/50" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Coping Strategy Used</label>
            <Textarea value={copingUsed} onChange={e => setCopingUsed(e.target.value)}
              placeholder="What did you do to cope?" rows={2} className="bg-muted/10 border-border/50" />
          </div>
          <Button onClick={saveEntry} disabled={saving} className="w-full">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Plus className="h-4 w-4 mr-2" /> Save Entry</>}
          </Button>
        </div>
      </Card>

      <h3 className="font-bold flex items-center gap-2"><Calendar className="h-4 w-4 text-cyan-400" /> Past Entries</h3>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-cyan-400" /></div>
      ) : entries.length === 0 ? (
        <Card className="p-8 text-center bg-card/80 border-border/50">
          <p className="text-sm text-muted-foreground">No journal entries yet. Start tracking your fears above.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => {
            const meta = entry.metadata as any;
            return (
              <Card key={entry.id} className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-[10px]">
                    Fear Level: {meta?.fear_level || "?"}/10
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm font-medium mb-1">{entry.prompt}</p>
                {entry.generated_text && <p className="text-xs text-muted-foreground">{entry.generated_text}</p>}
                {meta?.coping_used && (
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-green-500" />
                    <span className="text-[10px] text-green-500">{meta.coping_used}</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
};
