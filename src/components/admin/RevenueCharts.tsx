import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Bar, BarChart } from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const RevenueCharts = () => {
  const [daily, setDaily] = useState<any[]>([]);
  const [byType, setByType] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const { data: txs } = await supabase
        .from("transactions")
        .select("amount, commission_amount, item_type, created_at")
        .gte("created_at", since.toISOString());

      // Daily aggregation
      const byDay = new Map<string, number>();
      const byTypeMap = new Map<string, number>();
      txs?.forEach((t: any) => {
        const day = new Date(t.created_at).toISOString().slice(0, 10);
        const commission = parseFloat(t.commission_amount || 0);
        byDay.set(day, (byDay.get(day) || 0) + commission);
        const type = t.item_type || "other";
        byTypeMap.set(type, (byTypeMap.get(type) || 0) + commission);
      });

      // Fill 30 days
      const dailyArr: any[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dailyArr.push({ date: d.toLocaleDateString("en", { month: "short", day: "numeric" }), revenue: byDay.get(key) || 0 });
      }
      setDaily(dailyArr);

      const typeArr = Array.from(byTypeMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
      setByType(typeArr);
    };
    load();
  }, []);

  return (
    <>
      <FloatingHowItWorks title={"Revenue Charts - How it works"} steps={[{ title: 'Open', desc: 'Access the Revenue Charts section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Revenue Charts.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-card/70 backdrop-blur-xl border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-emerald-400" /> Revenue (30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ revenue: { label: "Revenue €", color: "hsl(var(--primary))" } }} className="h-[220px] w-full">
            <ResponsiveContainer>
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur-xl border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-cyan-400" /> Top Revenue Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ value: { label: "€", color: "hsl(var(--accent))" } }} className="h-[220px] w-full">
            <ResponsiveContainer>
              <BarChart data={byType} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
    </>
  );
};
