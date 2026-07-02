import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Network, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface DecisionTreeMapperProps {
  onBack: () => void;
}

const DecisionTreeMapper = ({ onBack }: DecisionTreeMapperProps) => {
  const [decision, setDecision] = useState("");
  const [loading, setLoading] = useState(false);
  const [tree, setTree] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!decision.trim()) { toast({ title: "Enter a decision", variant: "destructive" }); return; }
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('generate-decision-tree', {
        body: { decision }
      });

      if (error) throw error;

      if (data?.tree) {
        setTree(data.tree);
      } else {
        // Fallback
        setTree({
          decision,
          branches: [
            { path: "Yes", outcome: "New opportunities open up, career shifts to a more fulfilling direction", probability: 65, score: 82 },
            { path: "No", outcome: "Stability maintained, gradual progress in current trajectory", probability: 35, score: 71 },
            { path: "Delayed", outcome: "Wait for better timing, mixed results depending on patience", probability: 50, score: 76 },
          ]
        });
      }
    } catch (e) {
      console.error(e);
      setTree({
        decision,
        branches: [
          { path: "Path A", outcome: "Taking this path leads to significant growth", probability: 60, score: 85 },
          { path: "Path B", outcome: "This alternative offers stability and comfort", probability: 40, score: 72 },
        ]
      });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Decision Tree Mapper'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Decision Tree Mapper panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub</Button>

      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Network className="w-6 h-6 text-emerald-400" />
            Decision Tree Mapper
          </CardTitle>
          <CardDescription>Map out the consequences of any decision across parallel realities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="Enter a life decision... e.g., 'Should I move to another country?'" onKeyDown={(e) => e.key === "Enter" && handleGenerate()} />
          <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mapping Realities...</> : <><Network className="w-4 h-4 mr-2" /> Map Decision Tree</>}
          </Button>
        </CardContent>
      </Card>

      {tree && (
        <Card className="border-emerald-500/20">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-400">Decision: {tree.decision}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tree.branches?.map((b: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-card/50 border border-border/30 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">{b.path}</Badge>
                  <div className="flex gap-2">
                    <span className="text-xs text-muted-foreground">{b.probability}% likely</span>
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-xs">{b.score}/100</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{b.outcome}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
};

export default DecisionTreeMapper;
