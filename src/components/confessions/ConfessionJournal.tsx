import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, Plus, Trash2, Calendar, Tag, Save } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  created_at: string;
}

const moods = ["Reflective", "Grateful", "Burdened", "Hopeful", "Peaceful", "Struggling", "Growing"];

export const ConfessionJournal = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", mood: "Reflective", tags: "" });

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("ai_generated_content")
        .select("*")
        .eq("user_id", user.id)
        .eq("content_type", "blog_article" as any)
        .like("title", "Journal:%")
        .order("created_at", { ascending: false });

      if (data) {
        setEntries(data.map((e: any) => ({
          id: e.id,
          title: (e.title || "").replace("Journal: ", ""),
          content: e.generated_text || "",
          mood: e.prompt || "Reflective",
          tags: (e.metadata as any)?.tags || [],
          created_at: e.created_at,
        })));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({ title: "Please fill in title and content", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const tags = formData.tags.split(",").map(t => t.trim()).filter(Boolean);

      const { error } = await supabase.from("ai_generated_content").insert({
        user_id: user.id,
        content_type: "blog_article" as any,
        title: `Journal: ${formData.title}`,
        prompt: formData.mood,
        generated_text: formData.content,
        metadata: { tags, mood: formData.mood, type: "confession_journal" },
      });

      if (error) throw error;

      toast({ title: "Entry Saved!" });
      setFormData({ title: "", content: "", mood: "Reflective", tags: "" });
      setShowForm(false);
      loadEntries();
    } catch (error: any) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await supabase.from("ai_generated_content").delete().eq("id", id);
      setEntries(prev => prev.filter(e => e.id !== id));
      toast({ title: "Entry removed" });
    } catch {
      toast({ title: "Failed to remove", variant: "destructive" });
    }
  };

  if (loading) {
    return <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50"><Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" /></Card>;
  }

  return (
    <>
      <FloatingHowItWorks
        title='Confession Journal'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Confession Journal panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black mb-2">Confession Journal</h3>
            <p className="text-sm text-muted-foreground">
              A private space for spiritual reflections, personal growth notes, and documenting
              your journey toward redemption and inner peace.
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-2">
            <Plus className="h-3.5 w-3.5" /> New Entry
          </Button>
        </div>
      </Card>

      {/* New Entry Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-card/80 backdrop-blur-xl border-primary/30 space-y-4">
            <Input
              placeholder="Entry title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Write your reflection..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Mood</label>
                <Select value={formData.mood} onValueChange={(v) => setFormData({ ...formData, mood: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {moods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Tags (comma separated)</label>
                <Input
                  placeholder="forgiveness, growth, peace..."
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveEntry} disabled={saving} className="flex-1 gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Entry
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Entries */}
      {entries.length === 0 ? (
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <BookOpen className="h-12 w-12 mx-auto text-primary/30 mb-3" />
          <p className="text-muted-foreground mb-1">Your journal is empty</p>
          <p className="text-xs text-muted-foreground">Start writing reflections to document your spiritual journey</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-sm">{entry.title}</h4>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => deleteEntry(entry.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{entry.content}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">{entry.mood}</Badge>
                  {entry.tags?.slice(0, 3).map((tag, j) => (
                    <Badge key={j} variant="secondary" className="text-[10px]">
                      <Tag className="h-2 w-2 mr-0.5" />{tag}
                    </Badge>
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    <Calendar className="h-2.5 w-2.5 inline mr-0.5" />
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};
