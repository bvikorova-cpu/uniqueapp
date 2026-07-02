import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, Music, Users, DollarSign, TrendingUp } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const ConcertAnalytics = ({ onBack }: Props) => {
  const { data: stats } = useQuery({
    queryKey: ["concert-analytics"],
    queryFn: async () => {
      const [concerts, musicians, gifts] = await Promise.all([
        supabase.from("live_concert_streams").select("id", { count: "exact", head: true }),
        supabase.from("musician_profiles").select("id", { count: "exact", head: true }),
        supabase.from("platform_gifts").select("id", { count: "exact", head: true }),
      ]);
      return {
        totalConcerts: concerts.count || 0,
        totalMusicians: musicians.count || 0,
        totalGifts: gifts.count || 0,
      };
    },
  });

  const cards = [
    { icon: Music, label: "Total Concerts", value: stats?.totalConcerts || 0, color: "text-primary" },
    { icon: Users, label: "Registered Artists", value: stats?.totalMusicians || 0, color: "text-blue-500" },
    { icon: DollarSign, label: "Gift Types", value: stats?.totalGifts || 0, color: "text-emerald-500" },
    { icon: TrendingUp, label: "Revenue Split", value: "80/20", color: "text-amber-500" },
  ];

  return (
    <>
      <FloatingHowItWorks title="How Concert Analytics works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>
      <div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Concert Analytics</h2>
        <p className="text-muted-foreground text-sm mt-1">Platform-wide concert performance metrics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className="border-primary/10 hover:border-primary/30 transition-all">
            <CardContent className="p-4 text-center">
              <card.icon className={`h-8 w-8 mx-auto mb-2 ${card.color}`} />
              <p className="text-2xl font-black">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Ticket Sales Revenue</span>
              <span className="font-bold">80% Artist / 20% Platform</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-pink-500 rounded-full" style={{ width: "80%" }} />
            </div>
            <div className="flex justify-between text-sm">
              <span>Virtual Gift Revenue</span>
              <span className="font-bold">80% Artist / 20% Platform</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: "80%" }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
    );
};
