import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Euro, Download, ImageIcon, TrendingUp, BarChart3, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface EarningsDashboardViewProps {
  onBack: () => void;
}

interface SaleRow {
  id: string;
  amount_paid: number | string | null;
  creator_earning: number | string | null;
  platform_fee: number | string | null;
  license_type: string | null;
  created_at: string;
}

const num = (v: unknown) => {
  const n = parseFloat(String(v ?? 0));
  return Number.isFinite(n) ? n : 0;
};

export function EarningsDashboardView({ onBack }: EarningsDashboardViewProps) {
  const [earnings, setEarnings] = useState({
    total_revenue: 0,
    platform_fees: 0,
    gross: 0,
    total_downloads: 0,
    items_count: 0,
  });
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [signedIn, setSignedIn] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSignedIn(false); setLoading(false); return; }
    setSignedIn(true);

    const [salesRes, itemsRes] = await Promise.all([
      supabase
        .from('stock_content_sales')
        .select('id, amount_paid, creator_earning, platform_fee, license_type, created_at, status')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('stock_content_items')
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', user.id),
    ]);

    const paid = (salesRes.data || []).filter(
      (s: any) => !s.status || ['completed', 'paid', 'succeeded'].includes(String(s.status))
    ) as SaleRow[];

    const gross = paid.reduce((sum, s) => sum + num(s.amount_paid), 0);
    const net = paid.reduce(
      (sum, s) => sum + (s.creator_earning != null ? num(s.creator_earning) : num(s.amount_paid) * 0.7),
      0
    );
    const fees = paid.reduce(
      (sum, s) => sum + (s.platform_fee != null ? num(s.platform_fee) : num(s.amount_paid) * 0.3),
      0
    );

    setSales(paid.slice(0, 10));
    setEarnings({
      total_revenue: net,
      platform_fees: fees,
      gross,
      total_downloads: paid.length,
      items_count: itemsRes.count || 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);


  return (
    <>
      <FloatingHowItWorks title={"Earnings Dashboard View - How it works"} steps={[{ title: 'Open', desc: 'Access the Earnings Dashboard View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Earnings Dashboard View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-green-500" /> Earnings Dashboard</h2>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading earnings...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Euro className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings (70%)</p>
                  <p className="text-3xl font-black">€{earnings.total_revenue.toFixed(2)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Download className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Downloads</p>
                  <p className="text-3xl font-black">{earnings.total_downloads}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <ImageIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Items Published</p>
                  <p className="text-3xl font-black">{earnings.items_count}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Revenue Insights</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Avg. Price</p>
                <p className="text-xl font-bold">€{earnings.items_count > 0 ? ((earnings.total_revenue / 0.7) / earnings.items_count).toFixed(2) : "0.00"}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Avg. Downloads/Item</p>
                <p className="text-xl font-bold">{earnings.items_count > 0 ? Math.round(earnings.total_downloads / earnings.items_count) : 0}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Revenue/Download</p>
                <p className="text-xl font-bold">€{earnings.total_downloads > 0 ? (earnings.total_revenue / earnings.total_downloads).toFixed(2) : "0.00"}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Platform Fee (30%)</p>
                <p className="text-xl font-bold">€{(earnings.total_revenue / 0.7 * 0.3).toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
    </>
  );
}
