import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Infinity as InfinityIcon, TrendingUp, CheckCircle, AlertCircle, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const KarmicDebtTracker = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  const checkAccessAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCheckingAccess(false);
        return;
      }

      const { data } = await supabase
        .from("reincarnation_purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("service_type", "karmic_debt_calculator")
        .eq("status", "active")
        .single();

      setHasAccess(!!data);
      if (data) await calculateKarma();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCheckingAccess(false);
    }
  };

  const calculateKarma = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('calculate-karmic-debt');
      if (error) throw error;
      setInsights(data.insights);
      toast({ title: "Karma Calculated!", description: `Balance: ${data.insights.status}` });
    } catch (error) {
      toast({ title: "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAccess) return <Card><CardContent className="py-12 text-center"><Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" /></CardContent></Card>;
  if (!hasAccess) return <Card className="border-destructive/50"><CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-6 w-6" />Locked</CardTitle></CardHeader><CardContent><Alert><AlertDescription>Go to Services tab (€19/month)</AlertDescription></Alert></CardContent></Card>;

  return (
    <Card className="border-primary/20">
      <CardHeader><CardTitle className="flex items-center gap-2"><InfinityIcon className="h-6 w-6 text-primary" />Karmic Debt Tracker</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {insights && (
          <div className="space-y-4">
            <Card className="border-primary/30">
              <CardHeader><CardTitle>Balance: {insights.overall_balance}/100</CardTitle></CardHeader>
              <CardContent><Progress value={insights.overall_balance} className="h-3" /><div className="grid grid-cols-3 gap-4 mt-4"><div className="text-center"><p className="text-2xl font-bold text-primary">{insights.total_debts}</p><p className="text-xs">Total</p></div><div className="text-center"><p className="text-2xl font-bold text-green-500">{insights.resolved_debts}</p><p className="text-xs">Resolved</p></div><div className="text-center"><p className="text-2xl font-bold text-amber-500">{insights.active_debts}</p><p className="text-xs">Active</p></div></div></CardContent>
            </Card>
            <Card><CardHeader><CardTitle>Daily Actions</CardTitle></CardHeader><CardContent className="space-y-2">{insights.daily_actions?.map((action: any, i: number) => <div key={i} className="flex justify-between p-3 rounded bg-primary/5 border border-primary/20"><span className="text-sm">{action.action}</span><Badge>+{action.karma_points} pts</Badge></div>)}</CardContent></Card>
          </div>
        )}
        <Button onClick={calculateKarma} disabled={loading} variant="outline" className="w-full">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Calculating...</> : "Recalculate"}</Button>
      </CardContent>
    </Card>
  );
};
