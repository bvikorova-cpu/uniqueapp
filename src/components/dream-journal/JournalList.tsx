import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const moodIcons: Record<string, string> = {
  very_good: "😄",
  good: "🙂",
  neutral: "😐",
  bad: "😕",
  very_bad: "😢"
};

const JournalList = () => {
  const { toast } = useToast();
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false })
        .limit(10);

      if (error) throw error;
      setJournals(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks
          title='Journal List'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Journal List panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
      </>
    );
  }

  if (journals.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No journal entries yet. Start writing your first entry above!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recent Entries</h3>
      {journals.map((entry) => (
        <Card key={entry.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {moodIcons[entry.mood]} {entry.title}
                </CardTitle>
                <CardDescription>{new Date(entry.entry_date).toLocaleDateString()}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{entry.content}</p>
            </div>
            
            {entry.ai_insights && (
              <div className="p-4 bg-primary/5 rounded-lg">
                <h4 className="font-semibold mb-2">Insights</h4>
                <p className="text-sm">{entry.ai_insights}</p>
              </div>
            )}

            {entry.emotions_detected && entry.emotions_detected.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Emotions Detected</h4>
                <div className="flex flex-wrap gap-2">
                  {entry.emotions_detected.map((emotion: string, i: number) => (
                    <Badge key={i} variant="outline">{emotion}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default JournalList;