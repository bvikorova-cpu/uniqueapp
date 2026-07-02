import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Plus, Minus, Loader2 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface LedgerRow {
  id: string;
  delta: number;
  reason: string;
  balance_after: number;
  created_at: string;
}

const labelFor = (reason: string) => {
  if (reason.startsWith("monthly_topup")) return "Monthly top-up";
  if (reason === "signup_grant") return "Welcome gift";
  if (reason.startsWith("spend")) return "Spent";
  return reason.replace(/_/g, " ");
};

export const FreeTierHistory = () => {
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await (supabase as any)
        .from("free_tier_credit_ledger")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      setRows(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <FloatingHowItWorks title={"Free Tier History - How it works"} steps={[{ title: 'Open', desc: 'Access the Free Tier History section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Free Tier History.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-4 w-4 text-accent" />
        <h3 className="font-bold">Free credit history</h3>
      </div>

      {loading ? (
        <div className="flex justify-center p-6">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {rows.map((r) => {
            const positive = r.delta > 0;
            return (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      positive
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-rose-500/15 text-rose-400"
                    }`}
                  >
                    {positive ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{labelFor(r.reason)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-black tabular-nums ${
                      positive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {positive ? "+" : ""}
                    {r.delta}
                  </p>
                  <Badge variant="outline" className="text-[10px]">
                    bal {r.balance_after}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
    </>
  );
};
