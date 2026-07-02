import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Eye, Download, DollarSign, MousePointer, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface ContentAnalyticsViewProps {
  onBack: () => void;
}

interface AssetRow {
  id: string;
  name: string;
  views: number;
  downloads: number;
  revenue: number;
}

export function ContentAnalyticsView({ onBack }: ContentAnalyticsViewProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [totals, setTotals] = useState({ views: 0, downloads: 0, revenue: 0 });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const sb: any = supabase;
      const { data: items } = await sb
        .from("stock_content_items")
        .select("id, title, total_downloads, total_revenue_eur")
        .eq("creator_id", user.id)
        .order("total_revenue_eur", { ascending: false })
        .limit(20);

      const rows: AssetRow[] = (items || []).map((it: any) => ({
        id: it.id,
        name: it.title || "Untitled",
        views: 0,
        downloads: Number(it.total_downloads) || 0,
        revenue: Number(it.total_revenue_eur) || 0,
      }));

      const t = rows.reduce(
        (acc, r) => ({
          views: acc.views + r.views,
          downloads: acc.downloads + r.downloads,
          revenue: acc.revenue + r.revenue,
        }),
        { views: 0, downloads: 0, revenue: 0 }
      );

      if (!cancelled) {
        setAssets(rows);
        setTotals(t);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const avgCtr =
    totals.views > 0 ? ((totals.downloads / totals.views) * 100).toFixed(1) + "%" : "—";

  const statCards = [
    { label: "Total Views", value: totals.views.toLocaleString(), icon: Eye, color: "text-blue-500" },
    { label: "Downloads", value: totals.downloads.toLocaleString(), icon: Download, color: "text-green-500" },
    { label: "Revenue", value: `€${totals.revenue.toLocaleString()}`, icon: DollarSign, color: "text-amber-500" },
    { label: "Avg. CTR", value: avgCtr, icon: MousePointer, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-sky-500" /> Content Analytics
        </h2>
      </div>

      {!user ? (
        <Card className="p-10 text-center text-muted-foreground">
          Please sign in to see your analytics.
        </Card>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <Card key={i} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </Card>
              );
            })}
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Top Performing Assets</h3>
            {assets.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No assets uploaded yet. Upload your first asset to see analytics here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="pb-2 font-medium">#</th>
                      <th className="pb-2 font-medium">Asset</th>
                      <th className="pb-2 font-medium text-right">Downloads</th>
                      <th className="pb-2 font-medium text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((a, i) => (
                      <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/20">
                        <td className="py-3 font-bold">{i + 1}</td>
                        <td className="py-3 font-medium truncate max-w-[240px]">{a.name}</td>
                        <td className="py-3 text-right">{a.downloads.toLocaleString()}</td>
                        <td className="py-3 text-right text-green-400 font-semibold">
                          €{a.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
