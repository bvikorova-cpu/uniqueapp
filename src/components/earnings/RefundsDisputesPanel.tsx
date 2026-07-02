import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldAlert, Receipt } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Row {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  reason?: string | null;
}

/** Lists refunds + disputes from `payment_records` for the current seller. */
export function RefundsDisputesPanel() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("payment_records")
        .select("id, created_at, amount, status, refund_reason")
        .eq("seller_id", user.id)
        .in("status", ["refunded", "disputed", "chargeback"])
        .order("created_at", { ascending: false })
        .limit(20);
      setRows((data || []).map((r: any) => ({ ...r, reason: r.refund_reason })));
      setLoading(false);
    })();
  }, [user?.id]);

  return (
    <>
      <FloatingHowItWorks title={"Refunds Disputes Panel - How it works"} steps={[{ title: 'Open', desc: 'Access the Refunds Disputes Panel section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Refunds Disputes Panel.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-rose-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-500" /> Refunds & Disputes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="text-xs text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center py-4 text-muted-foreground text-xs">
            <Receipt className="h-6 w-6 mb-1 opacity-50" />
            No refunds or disputes — keep it up.
          </div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-xs border-b border-border/40 pb-1.5">
              <div>
                <p className="font-mono">€{Number(r.amount).toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()} {r.reason ? `· ${r.reason}` : ""}
                </p>
              </div>
              <Badge variant="destructive" className="text-[10px]">{r.status}</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
    </>
  );
}
