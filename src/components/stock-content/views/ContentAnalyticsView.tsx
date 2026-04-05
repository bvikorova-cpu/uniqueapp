import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, BarChart3, Eye, Download, DollarSign, TrendingUp, MousePointer } from "lucide-react";

interface ContentAnalyticsViewProps {
  onBack: () => void;
}

const mockAssets = [
  { name: "Sunset Mountain Lake", views: 12450, downloads: 342, revenue: 1026, ctr: 2.7, trend: "+15%" },
  { name: "Business Team Meeting", views: 9800, downloads: 278, revenue: 834, ctr: 2.8, trend: "+8%" },
  { name: "Abstract Blue Waves", views: 8200, downloads: 195, revenue: 585, ctr: 2.4, trend: "+22%" },
  { name: "Fresh Organic Food", views: 7600, downloads: 167, revenue: 501, ctr: 2.2, trend: "-3%" },
  { name: "City Skyline Night", views: 6900, downloads: 134, revenue: 402, ctr: 1.9, trend: "+5%" },
  { name: "Tropical Beach Paradise", views: 5400, downloads: 98, revenue: 294, ctr: 1.8, trend: "+12%" },
];

const statCards = [
  { label: "Total Views", value: "50,350", icon: Eye, color: "text-blue-500", change: "+12.5%" },
  { label: "Downloads", value: "1,214", icon: Download, color: "text-green-500", change: "+8.3%" },
  { label: "Revenue", value: "€3,642", icon: DollarSign, color: "text-amber-500", change: "+15.1%" },
  { label: "Avg. CTR", value: "2.3%", icon: MousePointer, color: "text-purple-500", change: "+0.4%" },
];

export function ContentAnalyticsView({ onBack }: ContentAnalyticsViewProps) {
  const [period, setPeriod] = useState("30d");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-sky-500" /> Content Analytics</h2>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${s.color}`} />
                <Badge variant="outline" className="text-green-400 text-[10px]">{s.change}</Badge>
              </div>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Revenue Chart Placeholder */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Revenue Over Time</h3>
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList className="h-8">
              <TabsTrigger value="7d" className="text-xs px-2 h-6">7D</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs px-2 h-6">30D</TabsTrigger>
              <TabsTrigger value="90d" className="text-xs px-2 h-6">90D</TabsTrigger>
              <TabsTrigger value="1y" className="text-xs px-2 h-6">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="h-48 bg-gradient-to-t from-sky-500/10 to-transparent rounded-lg flex items-end justify-around px-4 pb-4">
          {[35, 48, 42, 65, 58, 72, 68, 85, 78, 92, 88, 95].map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-4 md:w-6 bg-gradient-to-t from-sky-500 to-blue-400 rounded-t" style={{ height: `${h}%` }} />
              <span className="text-[9px] text-muted-foreground">{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Assets Table */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Top Performing Assets</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Asset</th>
                <th className="pb-2 font-medium text-right">Views</th>
                <th className="pb-2 font-medium text-right">Downloads</th>
                <th className="pb-2 font-medium text-right">Revenue</th>
                <th className="pb-2 font-medium text-right">CTR</th>
                <th className="pb-2 font-medium text-right">Trend</th>
              </tr>
            </thead>
            <tbody>
              {mockAssets.map((a, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="py-3 font-bold">{i + 1}</td>
                  <td className="py-3 font-medium">{a.name}</td>
                  <td className="py-3 text-right">{a.views.toLocaleString()}</td>
                  <td className="py-3 text-right">{a.downloads.toLocaleString()}</td>
                  <td className="py-3 text-right text-green-400 font-semibold">€{a.revenue}</td>
                  <td className="py-3 text-right">{a.ctr}%</td>
                  <td className="py-3 text-right">
                    <Badge variant="outline" className={a.trend.startsWith("+") ? "text-green-400" : "text-red-400"}>
                      <TrendingUp className="w-3 h-3 mr-1" />{a.trend}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
