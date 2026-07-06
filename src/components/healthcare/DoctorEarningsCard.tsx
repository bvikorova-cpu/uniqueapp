import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Euro, TrendingUp } from "lucide-react";

interface Payout {
  id: string;
  amount_cents: number;
  platform_fee_cents: number;
  currency: string;
  status: string;
  created_at: string;
  paid_at: string | null;
  appointment_id: string;
}

const STATUS_TONE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  paid: "default",
  cancelled: "secondary",
  failed: "destructive",
};

export function DoctorEarningsCard() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    // Table not in generated types yet — cast for now.
    const { data } = await (supabase as any)
      .from("doctor_payouts")
      .select("id, amount_cents, platform_fee_cents, currency, status, created_at, paid_at, appointment_id")
      .eq("doctor_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setPayouts((data as Payout[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = payouts.reduce(
    (acc, p) => {
      if (p.status === "paid") acc.paid += p.amount_cents;
      if (p.status === "pending") acc.pending += p.amount_cents;
      acc.fees += p.platform_fee_cents;
      return acc;
    },
    { paid: 0, pending: 0, fees: 0 },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Consultation earnings
        </CardTitle>
        <CardDescription>85% of every paid consultation. 15% platform fee.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/5 border">
                <p className="text-xs text-muted-foreground">Paid out</p>
                <p className="text-lg font-bold flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  {(totals.paid / 100).toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-accent/5 border">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-lg font-bold flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  {(totals.pending / 100).toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted border">
                <p className="text-xs text-muted-foreground">Platform fees</p>
                <p className="text-lg font-bold flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  {(totals.fees / 100).toFixed(2)}
                </p>
              </div>
            </div>

            {payouts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No consultation earnings yet. Paid bookings appear here automatically.
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {payouts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-sm border rounded-lg px-3 py-2"
                  >
                    <div>
                      <div className="font-medium">
                        €{(p.amount_cents / 100).toFixed(2)}{" "}
                        <span className="text-xs text-muted-foreground">
                          (fee €{(p.platform_fee_cents / 100).toFixed(2)})
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                        {p.paid_at ? ` · paid ${new Date(p.paid_at).toLocaleDateString()}` : ""}
                      </div>
                    </div>
                    <Badge variant={STATUS_TONE[p.status] ?? "outline"}>{p.status}</Badge>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-4">
              Payouts are transferred to your connected Stripe account. Contact support to configure or
              change payout schedule.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default DoctorEarningsCard;
