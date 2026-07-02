import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { GitBranch, Loader2, ArrowLeft, Circle } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface MultiverseTimelineProps {
  onBack: () => void;
}

const MultiverseTimeline = ({ onBack }: MultiverseTimelineProps) => {
  const [universes, setUniverses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data, error } = await supabase.functions.invoke('get-user-universes');
        if (error) throw error;
        setUniverses(data.universes || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <>
      <FloatingHowItWorks
        title='Multiverse Timeline'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Multiverse Timeline panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </Button>

      <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <GitBranch className="w-6 h-6 text-indigo-400" />
            Multiverse Timeline
          </CardTitle>
          <CardDescription>Visual timeline of where your realities diverged</CardDescription>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
      ) : universes.length === 0 ? (
        <Card className="border-muted"><CardContent className="py-12 text-center text-muted-foreground">No universes yet. Create some to see your timeline!</CardContent></Card>
      ) : (
        <div className="relative pl-8 space-y-0">
          {/* Timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-violet-500 to-purple-500" />
          
          {/* Origin point */}
          <div className="relative pb-8">
            <div className="absolute left-[-1.35rem] top-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-background shadow-lg shadow-indigo-500/50" />
            <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 to-background">
              <CardContent className="p-4">
                <p className="font-bold text-indigo-400">Origin Reality</p>
                <p className="text-xs text-muted-foreground">Your baseline life — the starting point for all divergences</p>
              </CardContent>
            </Card>
          </div>

          {/* Branch points */}
          {universes.map((u, i) => (
            <div key={u.id} className="relative pb-8">
              <div className="absolute left-[-1.35rem] top-1 flex items-center">
                <Circle className={`w-4 h-4 fill-current ${i % 3 === 0 ? 'text-violet-500' : i % 3 === 1 ? 'text-purple-500' : 'text-pink-500'}`} />
              </div>
              <Card className={`border-${i % 3 === 0 ? 'violet' : i % 3 === 1 ? 'purple' : 'pink'}-500/20 hover:border-${i % 3 === 0 ? 'violet' : i % 3 === 1 ? 'purple' : 'pink'}-500/40 transition-all`}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm">{u.universe_name}</p>
                    <span className="text-xs font-mono text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-primary font-medium">Divergence: {u.divergence_point}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{u.universe_description}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${u.success_score}%` }} />
                    </div>
                    <span className="text-xs font-bold">{u.success_score}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

export default MultiverseTimeline;
