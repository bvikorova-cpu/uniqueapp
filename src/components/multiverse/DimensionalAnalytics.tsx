import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Loader2, ArrowLeft } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface DimensionalAnalyticsProps {
  onBack: () => void;
}

const DimensionalAnalytics = ({ onBack }: DimensionalAnalyticsProps) => {
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

  const barData = universes.map(u => ({ name: u.universe_name?.substring(0, 15), score: u.success_score }));
  const radarData = universes.slice(0, 5).map(u => ({
    dimension: u.universe_name?.substring(0, 10),
    success: u.success_score,
    potential: Math.min(100, u.success_score + Math.floor(Math.random() * 20)),
  }));

  return (
    <>
      <FloatingHowItWorks
        title='Dimensional Analytics'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Dimensional Analytics panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub</Button>

      <Card className="border-violet-500/20 bg-gradient-to-br from-violet-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="w-6 h-6 text-violet-400" />
            Dimensional Analytics
          </CardTitle>
          <CardDescription>Analyze performance across all your parallel realities</CardDescription>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-violet-400" /></div>
      ) : universes.length === 0 ? (
        <Card className="border-muted"><CardContent className="py-12 text-center text-muted-foreground">No data yet. Create universes first!</CardContent></Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card className="border-violet-500/20">
            <CardHeader><CardTitle className="text-sm">Success Scores</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-violet-500/20">
            <CardHeader><CardTitle className="text-sm">Reality Radar</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9 }} />
                  <Radar dataKey="success" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  <Radar dataKey="potential" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.1} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </>
  );
};

export default DimensionalAnalytics;
