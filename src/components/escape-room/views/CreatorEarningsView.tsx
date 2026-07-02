import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, DollarSign, TrendingUp, Users, BarChart3 } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function CreatorEarningsView({ onBack }: Props) {
  const stats = [
    { label: "Total Revenue", value: "€3,420", icon: DollarSign },
    { label: "Your Share (70%)", value: "€2,394", icon: TrendingUp },
    { label: "Total Plays", value: "1,847", icon: Users },
    { label: "Published Rooms", value: "8", icon: BarChart3 },
  ];

  const months = [
    { month: "March 2026", revenue: "€840", plays: 423, payout: "€588" },
    { month: "February 2026", revenue: "€720", plays: 367, payout: "€504" },
    { month: "January 2026", revenue: "€580", plays: 294, payout: "€406" },
    { month: "December 2025", revenue: "€490", plays: 248, payout: "€343" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Creator Earnings View - How it works"} steps={[{ title: 'Open', desc: 'Access the Creator Earnings View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Creator Earnings View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Creator Earnings</h2>
            <p className="text-muted-foreground">Track your room revenue (70/30 split)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="border-emerald-500/10">
                <CardContent className="p-4 text-center">
                  <Icon className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <div className="text-xl font-black">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left p-3">Month</th><th className="text-center p-3">Plays</th><th className="text-center p-3">Revenue</th><th className="text-right p-3">Your Payout</th></tr></thead>
              <tbody>
                {months.map((m, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{m.month}</td>
                    <td className="p-3 text-center">{m.plays}</td>
                    <td className="p-3 text-center">{m.revenue}</td>
                    <td className="p-3 text-right font-bold text-emerald-500">{m.payout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
