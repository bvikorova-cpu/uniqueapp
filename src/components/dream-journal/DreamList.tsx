import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface DreamEntry {
  id: string;
  title: string;
  content: string;
  dream_date: string;
  ai_analysis: string | null;
  themes: any;
  emotions: any;
  symbols: any;
  created_at: string;
}

const DreamList = () => {
  const { toast } = useToast();
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDreams();
  }, []);

  const loadDreams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("dream_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("dream_date", { ascending: false })
        .limit(10);

      if (error) throw error;
      setDreams(data || []);
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
          title='Dream List'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Dream List panel from this page.' },
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

  if (dreams.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No dreams recorded yet. Start by analyzing your first dream above!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recent Dreams</h3>
      {dreams.map((dream) => (
        <Card key={dream.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{dream.title}</CardTitle>
                <CardDescription>{new Date(dream.dream_date).toLocaleDateString()}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {dream.themes?.map((theme, i) => (
                  <Badge key={i} variant="secondary">{theme}</Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Dream Content</h4>
              <p className="text-sm text-muted-foreground">{dream.content}</p>
            </div>
            
            {dream.ai_analysis && (
              <div className="p-4 bg-primary/5 rounded-lg">
                <h4 className="font-semibold mb-2">Analysis</h4>
                <p className="text-sm">{dream.ai_analysis}</p>
              </div>
            )}

            {dream.emotions && dream.emotions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Emotions Detected</h4>
                <div className="flex flex-wrap gap-2">
                  {dream.emotions.map((emotion, i) => (
                    <Badge key={i} variant="outline">{emotion}</Badge>
                  ))}
                </div>
              </div>
            )}

            {dream.symbols && dream.symbols.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Symbols Found</h4>
                <div className="space-y-2">
                  {dream.symbols.map((symbol: any, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium">{symbol.symbol}:</span> {symbol.meaning}
                    </div>
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

export default DreamList;