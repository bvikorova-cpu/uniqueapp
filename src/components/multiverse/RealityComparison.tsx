import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Loader2, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface RealityComparisonProps {
  onBack: () => void;
}

const RealityComparison = ({ onBack }: RealityComparisonProps) => {
  const [universes, setUniverses] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => { loadUniverses(); }, []);

  const loadUniverses = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase.functions.invoke('get-user-universes');
      if (error) throw error;
      setUniverses(data.universes || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 4 ? [...prev, id] : prev);
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      toast({ title: "Select at least 2 universes", variant: "destructive" });
      return;
    }
    try {
      setComparing(true);
      const selected = universes.filter(u => selectedIds.includes(u.id));
      const comparisonData = {
        universes: selected.map(u => ({
          name: u.universe_name,
          score: u.success_score,
          description: u.universe_description,
          divergence: u.divergence_point,
          parameters: u.parameters || {},
        }))
      };
      setComparison(comparisonData);
    } finally { setComparing(false); }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Reality Comparison'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Reality Comparison panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </Button>

      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            Reality Comparison Tool
          </CardTitle>
          <CardDescription>Compare 2-4 parallel versions of yourself side by side</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Selected: {selectedIds.length}/4</p>
            <Button onClick={handleCompare} disabled={selectedIds.length < 2 || comparing} className="bg-gradient-to-r from-blue-500 to-cyan-500">
              {comparing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
              Compare
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
      ) : universes.length === 0 ? (
        <Card className="border-muted"><CardContent className="py-12 text-center text-muted-foreground">No universes yet. Create some first!</CardContent></Card>
      ) : (
        <>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {universes.map(u => (
              <Card key={u.id} className={`cursor-pointer transition-all ${selectedIds.includes(u.id) ? 'border-blue-500 bg-blue-500/10' : 'border-border/40 hover:border-blue-500/40'}`}
                onClick={() => toggleSelection(u.id)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Checkbox checked={selectedIds.includes(u.id)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{u.universe_name}</p>
                    <p className="text-xs text-muted-foreground">Score: {u.success_score}/100</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {comparison && (
            <Card className="border-blue-500/20">
              <CardHeader><CardTitle className="text-lg text-blue-400">Comparison Results</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {comparison.universes.map((u: any, i: number) => (
                  <div key={i} className="space-y-2 p-3 rounded-xl bg-card/50 border border-border/30">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-sm">{u.name}</p>
                      <span className="text-xs font-mono text-blue-400">{u.score}/100</span>
                    </div>
                    <Progress value={u.score} className="h-2" />
                    <p className="text-xs text-muted-foreground">{u.divergence}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
    </>
  );
};

export default RealityComparison;
