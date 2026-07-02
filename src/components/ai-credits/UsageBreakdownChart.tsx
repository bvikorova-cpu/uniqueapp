import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { ChartPie } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const COLORS = ["hsl(var(--primary))", "#a855f7", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#ef4444"];

export function UsageBreakdownChart() {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const since = new Date(Date.now() - 30 * 86400_000).toISOString();
      const { data: rows } = await supabase
        .from("ai_usage_history")
        .select("usage_type, credits_used")
        .eq("user_id", user.id)
        .gte("created_at", since);
      const map = new Map<string, number>();
      (rows || []).forEach((r: any) => {
        const k = r.usage_type || "other";
        map.set(k, (map.get(k) || 0) + (r.credits_used || 0));
      });
      setData([...map.entries()].map(([name, value]) => ({ name, value })));
    })();
  }, []);

  if (!data.length) return null;

  return (
    <>
      <FloatingHowItWorks title={"Usage Breakdown Chart - How it works"} steps={[{ title: 'Open', desc: 'Access the Usage Breakdown Chart section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Usage Breakdown Chart.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ChartPie className="h-5 w-5 text-primary" />
          <CardTitle>Usage by tool (30d)</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
