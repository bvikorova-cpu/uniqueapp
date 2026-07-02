import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Compass, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface QuantumNavigatorProps {
  onBack: () => void;
}

const QuantumNavigator = ({ onBack }: QuantumNavigatorProps) => {
  const [universes, setUniverses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const current = universes[currentIndex];

  return (
    <>
      <FloatingHowItWorks
        title='Quantum Navigator'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Quantum Navigator panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </Button>

      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Compass className="w-6 h-6 text-cyan-400" />
            Quantum Navigator
          </CardTitle>
          <CardDescription>Navigate through your parallel dimensions one by one</CardDescription>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>
      ) : universes.length === 0 ? (
        <Card className="border-muted"><CardContent className="py-12 text-center text-muted-foreground">No universes to navigate. Create some first!</CardContent></Card>
      ) : current ? (
        <Card className="border-cyan-500/20 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-cyan-500 to-teal-500" />
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Reality {currentIndex + 1} of {universes.length}</p>
              <h3 className="text-2xl font-black text-cyan-400">{current.universe_name}</h3>
            </div>
            <p className="text-sm text-muted-foreground text-center">{current.universe_description}</p>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold">Success Score: {current.success_score}/100</span>
            </div>
            <p className="text-xs text-center text-primary">Diverged at: {current.divergence_point}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}>Previous</Button>
              <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500" onClick={() => setCurrentIndex(i => Math.min(universes.length - 1, i + 1))} disabled={currentIndex === universes.length - 1}>Next</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
    </>
  );
};

export default QuantumNavigator;
