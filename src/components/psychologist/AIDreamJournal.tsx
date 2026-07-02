import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Moon, Sparkles, Star, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const DREAM_TYPES = ["Lucid", "Nightmare", "Recurring", "Prophetic", "Flying", "Falling", "Chase", "Normal"];

export const AIDreamJournal = ({ onBack }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dreamType, setDreamType] = useState("Normal");
  const [vividness, setVividness] = useState(5);
  const [entries, setEntries] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await (supabase as any).from("psychology_dream_entries")
      .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
    if (data) setEntries(data);
  };

  const saveDream = async () => {
    if (!description.trim()) { toast.error("Please describe your dream"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }
      const { error } = await (supabase as any).from("psychology_dream_entries").insert({
        user_id: user.id,
        title: title || "Untitled Dream",
        description: description.trim(),
        dream_type: dreamType,
        vividness_score: vividness,
      });
      if (error) throw error;
      toast.success("Dream logged!");
      setTitle(""); setDescription(""); setVividness(5); setDreamType("Normal");
      loadEntries();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const analyzeDream = async (entryId: string, dreamText: string) => {
    setAnalyzing(entryId);
    try {
      const { data, error } = await supabase.functions.invoke("psychology-ai", {
        body: { action: "dream-analysis", dreamId: entryId, dreamText },
      });
      if (error) throw error;
      setSelectedAnalysis(data?.analysis || "No analysis available.");
      loadEntries();
      toast.success("Dream analyzed! 5 credits used.");
    } catch (e: any) {
      if (e.message?.includes("credits") || e.message?.includes("Insufficient")) {
        toast.error("Insufficient credits. Please purchase more.");
      } else {
        toast.error("Analysis failed: " + (e.message || "Unknown error"));
      }
    } finally { setAnalyzing(null); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Dream Journal - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Dream Journal section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Dream Journal.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
          AI Dream Journal
        </h2>
        <p className="text-muted-foreground">Log your dreams and unlock AI psychological interpretations.</p>
        <Badge variant="outline" className="mt-2 gap-1"><Sparkles className="h-3 w-3" /> 5 Credits per AI Interpretation</Badge>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center bg-card/50 backdrop-blur-sm border-border/50">
          <p className="text-2xl font-black text-primary">{entries.length}</p>
          <p className="text-xs text-muted-foreground">Dreams Logged</p>
        </Card>
        <Card className="p-4 text-center bg-card/50 backdrop-blur-sm border-border/50">
          <p className="text-2xl font-black text-primary">{entries.filter(e => e.ai_interpretation).length}</p>
          <p className="text-xs text-muted-foreground">Analyzed</p>
        </Card>
        <Card className="p-4 text-center bg-card/50 backdrop-blur-sm border-border/50">
          <p className="text-2xl font-black text-primary">
            {entries.length > 0 ? (entries.reduce((s: number, e: any) => s + (e.vividness_score || 5), 0) / entries.length).toFixed(1) : "—"}
          </p>
          <p className="text-xs text-muted-foreground">Avg Vividness</p>
        </Card>
      </div>

      {/* Log Dream */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Moon className="h-5 w-5 text-primary" /> Log a Dream</h3>
        <div className="space-y-4">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Dream title (optional)" />
          <Textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Describe your dream in as much detail as you can remember..." rows={5} />
          <div>
            <p className="text-sm font-medium mb-2">Dream Type</p>
            <div className="flex flex-wrap gap-2">
              {DREAM_TYPES.map(t => (
                <Badge key={t} variant={dreamType === t ? "default" : "outline"} className="cursor-pointer" onClick={() => setDreamType(t)}>{t}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Vividness: {vividness}/10</p>
            <input type="range" min={1} max={10} value={vividness} onChange={e => setVividness(Number(e.target.value))}
              className="w-full accent-primary" />
          </div>
          <Button onClick={saveDream} disabled={saving || !description.trim()} className="w-full">
            {saving ? "Saving..." : "Log Dream"}
          </Button>
        </div>
      </Card>

      {/* Analysis View */}
      {selectedAnalysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2"><Eye className="h-5 w-5 text-primary" /> AI Interpretation</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAnalysis(null)}>Close</Button>
            </div>
            <div className="prose prose-sm max-w-none"><ReactMarkdown>{selectedAnalysis}</ReactMarkdown></div>
          </Card>
        </motion.div>
      )}

      {/* Dream History */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg">Dream Journal</h3>
        {entries.length === 0 && <p className="text-sm text-muted-foreground">No dreams logged yet. Start your journal!</p>}
        {entries.map((entry, i) => (
          <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Moon className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-bold text-sm">{entry.title || "Untitled"}</span>
                    <Badge variant="outline" className="text-[10px]">{entry.dream_type}</Badge>
                    <span className="text-[10px] text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{entry.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: entry.vividness_score || 5 }).map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-primary text-primary" />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">Vividness</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {entry.ai_interpretation ? (
                    <Button variant="outline" size="sm" onClick={() => setSelectedAnalysis(entry.ai_interpretation)} className="gap-1">
                      <Eye className="h-3 w-3" /> View
                    </Button>
                  ) : (
                    <Button variant="default" size="sm" disabled={analyzing === entry.id}
                      onClick={() => analyzeDream(entry.id, entry.description)} className="gap-1">
                      {analyzing === entry.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      Analyze
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
};
