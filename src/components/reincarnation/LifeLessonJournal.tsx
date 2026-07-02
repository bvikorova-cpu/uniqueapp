import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, Plus, Trash2, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
}

export const LifeLessonJournal = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("activity_feed")
        .select("*")
        .eq("user_id", user.id)
        .eq("activity_type", "life_lesson_journal")
        .order("created_at", { ascending: false });

      if (data) {
        setEntries(data.map((d: any) => ({
          id: d.id,
          title: (d.metadata as any)?.title || "Untitled",
          content: (d.metadata as any)?.content || "",
          tags: (d.metadata as any)?.tags || [],
          created_at: d.created_at,
        })));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Title and content required", variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign in required", variant: "destructive" });
        return;
      }

      const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);

      const { data, error } = await supabase.from("activity_feed").insert({
        user_id: session.user.id,
        activity_type: "life_lesson_journal",
        metadata: { title: title.trim(), content: content.trim(), tags },
      }).select().single();

      if (error) throw error;

      setEntries((prev) => [{
        id: data.id,
        title: title.trim(),
        content: content.trim(),
        tags,
        created_at: data.created_at,
      }, ...prev]);
      setTitle("");
      setContent("");
      setTagInput("");
      setShowForm(false);
      toast({ title: "Journal entry saved!" });
    } catch (error) {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await supabase.from("activity_feed").delete().eq("id", id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast({ title: "Entry removed" });
    } catch (error) {
      toast({ title: "Failed to remove", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks
          title='Life Lesson Journal'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Life Lesson Journal panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
      </Card>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-black">Life Lesson Journal</h3>
            <p className="text-sm text-muted-foreground">
              Record insights, karmic lessons, and spiritual growth moments. 
              Track recurring themes across your past life discoveries.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
            <Plus className="h-4 w-4 mr-1" />{showForm ? "Cancel" : "New Entry"}
          </Button>
        </div>

        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 space-y-3">
            <Input placeholder="Entry title..." value={title} onChange={(e) => setTitle(e.target.value)} className="bg-background/50" />
            <Textarea placeholder="Your reflection, insight, or lesson..." value={content} onChange={(e) => setContent(e.target.value)} rows={5} className="bg-background/50" />
            <Input placeholder="Tags (comma-separated): karma, forgiveness, love" value={tagInput} onChange={(e) => setTagInput(e.target.value)} className="bg-background/50" />
            <Button onClick={saveEntry} disabled={saving} className="w-full">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Entry"}
            </Button>
          </motion.div>
        )}
      </Card>

      {entries.length === 0 ? (
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <BookOpen className="h-12 w-12 mx-auto text-primary/30 mb-3" />
          <p className="text-muted-foreground">No journal entries yet. Start documenting your spiritual journey.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-sm">{entry.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteEntry(entry.id)}>
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{entry.content}</p>
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag, j) => (
                      <Badge key={j} variant="outline" className="text-[9px]">{tag}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
