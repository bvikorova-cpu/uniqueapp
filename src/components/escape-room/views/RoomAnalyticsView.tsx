import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Clock, Users, Star, TrendingUp } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function RoomAnalyticsView({ onBack }: Props) {
  const stats = [
    { label: "Total Plays", value: "2,847", change: "+12%", icon: Users },
    { label: "Avg. Completion", value: "34:21", change: "-2min", icon: Clock },
    { label: "Avg. Rating", value: "4.7", change: "+0.2", icon: Star },
    { label: "Revenue", value: "€1,240", change: "+18%", icon: TrendingUp },
  ];

  const rooms = [
    { name: "Haunted Manor", plays: 423, rating: 4.8, completion: "78%", revenue: "€320" },
    { name: "Cyberpunk Heist", plays: 387, rating: 4.6, completion: "62%", revenue: "€290" },
    { name: "Dragon's Lair", plays: 312, rating: 4.9, completion: "54%", revenue: "€240" },
    { name: "Mars Colony", plays: 298, rating: 4.5, completion: "71%", revenue: "€210" },
    { name: "Detective's Office", plays: 267, rating: 4.7, completion: "83%", revenue: "€180" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Room Analytics View - How it works"} steps={[{ title: 'Open', desc: 'Access the Room Analytics View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Room Analytics View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Room Analytics</h2>
            <p className="text-muted-foreground">Performance insights for your escape rooms</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="border-indigo-500/10">
                <CardContent className="p-4 text-center">
                  <Icon className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                  <div className="text-2xl font-black">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="text-xs text-emerald-500 font-semibold mt-1">{s.change}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Room</th>
                    <th className="text-center p-3 font-semibold">Plays</th>
                    <th className="text-center p-3 font-semibold">Rating</th>
                    <th className="text-center p-3 font-semibold">Completion</th>
                    <th className="text-right p-3 font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-medium">{r.name}</td>
                      <td className="p-3 text-center">{r.plays}</td>
                      <td className="p-3 text-center">⭐ {r.rating}</td>
                      <td className="p-3 text-center">{r.completion}</td>
                      <td className="p-3 text-right font-semibold text-emerald-500">{r.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
