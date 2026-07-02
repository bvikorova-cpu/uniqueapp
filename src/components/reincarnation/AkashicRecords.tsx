import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface AkashicEntry {
  question: string;
  answer: string;
  category: string;
  created_at: string;
}

export const AkashicRecords = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [entries, setEntries] = useState<AkashicEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingEntries(false); return; }

      const { data } = await supabase
        .from("activity_feed")
        .select("*")
        .eq("user_id", user.id)
        .eq("activity_type", "akashic_query")
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setEntries(data.map((d: any) => ({
          question: (d.metadata as any)?.question || "",
          answer: (d.metadata as any)?.answer || "",
          category: (d.metadata as any)?.category || "general",
          created_at: d.created_at,
        })));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingEntries(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign in required", variant: "destructive" });
        return;
      }

      // Use the reincarnation plan edge function to generate akashic response
      const { data, error } = await supabase.functions.invoke("create-reincarnation-plan", {
        body: { planName: "Akashic Query", goalDescription: question },
      });
      if (error) throw error;

      const answer = data.plan?.soul_missions?.[0]?.mission || 
        "The Akashic Records reveal that your answer lies within your own spiritual growth journey. Meditate on this question and the universe will guide you.";

      const newEntry: AkashicEntry = {
        question: question.trim(),
        answer,
        category: "spiritual guidance",
        created_at: new Date().toISOString(),
      };

      // Save to activity feed
      await supabase.from("activity_feed").insert({
        user_id: session.user.id,
        activity_type: "akashic_query",
        metadata: { question: newEntry.question, answer: newEntry.answer, category: newEntry.category },
      });

      setEntries((prev) => [newEntry, ...prev]);
      setQuestion("");
      toast({ title: "Akashic Records Accessed", description: "Your cosmic answer has been revealed" });
    } catch (error) {
      toast({ title: "Failed to access records", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Akashic Records'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Akashic Records panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="text-lg font-black mb-2">Akashic Records</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Access the universal library of all souls. Ask any question about your past lives,
          karmic patterns, soul contracts, or spiritual purpose and receive AI-channeled guidance.
        </p>

        <div className="space-y-3">
          <Textarea
            placeholder="Ask the Akashic Records anything about your soul's journey..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            className="bg-background/50"
          />
          <Button onClick={askQuestion} disabled={loading || !question.trim()} className="w-full">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Channeling...</> : <><Send className="mr-2 h-4 w-4" />Access Records</>}
          </Button>
        </div>
      </Card>

      {loadingEntries ? (
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
        </Card>
      ) : entries.length === 0 ? (
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <BookOpen className="h-12 w-12 mx-auto text-primary/30 mb-3" />
          <p className="text-muted-foreground">No queries yet. Ask the Akashic Records your first question.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
                <div className="flex items-start gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">{entry.question}</p>
                </div>
                <div className="ml-6 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs text-muted-foreground leading-relaxed">{entry.answer}</p>
                </div>
                <div className="ml-6 mt-2 flex gap-2">
                  <Badge variant="outline" className="text-[10px]">{entry.category}</Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString()}
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
