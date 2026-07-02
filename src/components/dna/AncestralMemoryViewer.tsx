import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, MapPin, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Memory {
  id: string;
  ancestor_name: string;
  ancestor_era: string;
  ancestor_location: string;
  memory_story: string;
  memory_type: string;
  historical_context: string;
}

export const AncestralMemoryViewer = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("ancestral_memories")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error("Error loading memories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks
          title='Ancestral Memory Viewer'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Ancestral Memory Viewer panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      </>
    );
  }

  if (memories.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No ancestral memories yet. Complete a DNA analysis to unlock memories!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Ancestral Memories</h3>
        <p className="text-muted-foreground">AI-reconstructed memories from your ancestors</p>
      </div>

      <div className="grid gap-6">
        {memories.map((memory) => (
          <Card key={memory.id} className="border-primary/20 bg-card/50 backdrop-blur overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {memory.ancestor_name}
              </CardTitle>
              <CardDescription className="flex flex-wrap gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {memory.ancestor_era}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {memory.ancestor_location}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="italic text-foreground/90 leading-relaxed">
                  "{memory.memory_story}"
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Historical Context</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {memory.historical_context}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full capitalize">
                  {memory.memory_type.replace('_', ' ')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
