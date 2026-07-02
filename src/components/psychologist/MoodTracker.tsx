import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Smile, Frown, Meh, Heart, Zap, Sun, Moon, CloudRain, Flame, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const MOODS = [
  { score: 1, label: "Terrible", icon: Frown, color: "text-red-500", bg: "bg-red-500/20" },
  { score: 2, label: "Bad", icon: Frown, color: "text-red-400", bg: "bg-red-400/20" },
  { score: 3, label: "Poor", icon: CloudRain, color: "text-orange-400", bg: "bg-orange-400/20" },
  { score: 4, label: "Low", icon: Meh, color: "text-orange-300", bg: "bg-orange-300/20" },
  { score: 5, label: "Okay", icon: Meh, color: "text-yellow-400", bg: "bg-yellow-400/20" },
  { score: 6, label: "Fine", icon: Sun, color: "text-yellow-300", bg: "bg-yellow-300/20" },
  { score: 7, label: "Good", icon: Smile, color: "text-green-400", bg: "bg-green-400/20" },
  { score: 8, label: "Great", icon: Heart, color: "text-green-500", bg: "bg-green-500/20" },
  { score: 9, label: "Amazing", icon: Star, color: "text-emerald-400", bg: "bg-emerald-400/20" },
  { score: 10, label: "Fantastic", icon: Flame, color: "text-emerald-500", bg: "bg-emerald-500/20" },
];

const TAGS = ["Anxious", "Stressed", "Happy", "Grateful", "Lonely", "Motivated", "Tired", "Peaceful", "Angry", "Hopeful"];

interface Props { onBack: () => void; }

export const MoodTracker = ({ onBack }: Props) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [journal, setJournal] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await (supabase as any).from("psychology_mood_entries")
      .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
    if (data) setEntries(data);
  };

  const saveMood = async () => {
    if (!selectedMood) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }

      const mood = MOODS.find(m => m.score === selectedMood)!;
      const { error } = await (supabase as any).from("psychology_mood_entries").insert({
        user_id: user.id, mood_score: selectedMood, mood_label: mood.label,
        journal_entry: journal || null, tags: selectedTags,
      });
      if (error) throw error;
      toast.success("Mood logged successfully!");
      setSelectedMood(null); setJournal(""); setSelectedTags([]);
      loadEntries();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const avgMood = entries.length > 0
    ? (entries.reduce((s, e) => s + e.mood_score, 0) / entries.length).toFixed(1)
    : "—";

  return (
    <>
      <FloatingHowItWorks title={"Mood Tracker - How it works"} steps={[{ title: 'Open', desc: 'Access the Mood Tracker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Mood Tracker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
          Mood Tracker & Journal
        </h2>
        <p className="text-muted-foreground">Track your emotions daily to understand patterns and improve wellbeing.</p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center bg-card/50 backdrop-blur-sm border-border/50">
          <p className="text-2xl font-black text-primary">{entries.length}</p>
          <p className="text-xs text-muted-foreground">Total Entries</p>
        </Card>
        <Card className="p-4 text-center bg-card/50 backdrop-blur-sm border-border/50">
          <p className="text-2xl font-black text-primary">{avgMood}</p>
          <p className="text-xs text-muted-foreground">Avg Mood</p>
        </Card>
        <Card className="p-4 text-center bg-card/50 backdrop-blur-sm border-border/50">
          <p className="text-2xl font-black text-primary">{entries.filter(e => {
            const d = new Date(e.created_at); const now = new Date();
            return d.toDateString() === now.toDateString();
          }).length}</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </Card>
      </div>

      {/* Mood Selector */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <h3 className="font-bold mb-4">How are you feeling right now?</h3>
        <div className="grid grid-cols-5 gap-2">
          {MOODS.map(mood => (
            <motion.button
              key={mood.score}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMood(mood.score)}
              className={`p-3 rounded-xl text-center transition-all ${
                selectedMood === mood.score
                  ? `${mood.bg} ring-2 ring-primary`
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <mood.icon className={`h-6 w-6 mx-auto ${mood.color}`} />
              <p className="text-[10px] mt-1 font-medium">{mood.label}</p>
            </motion.button>
          ))}
        </div>

        {selectedMood && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Tags (optional)</p>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >{tag}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Journal Entry (optional)</p>
              <Textarea
                value={journal}
                onChange={e => setJournal(e.target.value)}
                placeholder="Write about your feelings, what happened today..."
                rows={4}
              />
            </div>
            <Button onClick={saveMood} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Log Mood"}
            </Button>
          </motion.div>
        )}
      </Card>

      {/* History */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg">Recent Entries</h3>
        {entries.length === 0 && <p className="text-sm text-muted-foreground">No entries yet. Start tracking your mood!</p>}
        {entries.slice(0, 10).map((entry, i) => {
          const mood = MOODS.find(m => m.score === entry.mood_score) || MOODS[4];
          return (
            <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${mood.bg}`}>
                    <mood.icon className={`h-5 w-5 ${mood.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{mood.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {entry.journal_entry && (
                      <p className="text-sm text-muted-foreground truncate">{entry.journal_entry}</p>
                    )}
                    {entry.tags?.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {entry.tags.map((t: string) => <Badge key={t} variant="outline" className="text-[10px] py-0">{t}</Badge>)}
                      </div>
                    )}
                  </div>
                  <span className="text-2xl font-black text-primary">{entry.mood_score}</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
    </>
  );
};
