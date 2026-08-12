import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Music, Ticket, Gift, Euro } from "lucide-react";

interface EarningRow {
  id: string;
  created_at: string | null;
  transaction_type: string;
  total_amount: number;
  platform_commission: number;
  musician_amount: number;
}

const eur = (n: number) => `€${Number(n || 0).toFixed(2)}`;

export const ConcertEarningsCard = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<EarningRow[]>([]);
  const [profile, setProfile] = useState<{ stage_name: string; pending_balance: number; total_withdrawn: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: prof } = await supabase
          .from("musician_profiles")
          .select("id, stage_name, pending_balance, total_withdrawn")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!prof) return;
        setProfile({
          stage_name: (prof as any).stage_name,
          pending_balance: Number((prof as any).pending_balance || 0),
          total_withdrawn: Number((prof as any).total_withdrawn || 0),
        });
        const { data } = await supabase
          .from("musician_earnings")
          .select("id, created_at, transaction_type, total_amount, platform_commission, musician_amount")
          .eq("musician_id", (prof as any).id)
          .order("created_at", { ascending: false })
          .limit(200);
        setRows((data as any[]) || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !profile) return null;

  const isTicket = (t: string) => t.toLowerCase().includes("ticket");
  const tickets = rows.filter(r => isTicket(r.transaction_type));
  const gifts = rows.filter(r => !isTicket(r.transaction_type));
  const sum = (list: EarningRow[], key: keyof EarningRow) =>
    list.reduce((s, r) => s + Number(r[key] as number || 0), 0);

  const gross = sum(rows, "total_amount");
  const artistShare = sum(rows, "musician_amount");
  const platformFee = sum(rows, "platform_commission");

  return (
    <Card className="border-purple-500/30 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5 text-purple-600" />
          Concert earnings — {profile.stage_name}
          <Badge variant="outline" className="ml-auto border-purple-500/40 text-purple-700">80 / 20</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><Ticket className="w-3 h-3" /> Tickets</div>
            <div className="text-lg font-bold">{tickets.length}</div>
            <div className="text-xs text-muted-foreground">{eur(sum(tickets, "total_amount"))} gross</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><Gift className="w-3 h-3" /> Gifts</div>
            <div className="text-lg font-bold">{gifts.length}</div>
            <div className="text-xs text-muted-foreground">{eur(sum(gifts, "total_amount"))} gross</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><Euro className="w-3 h-3" /> Total gross</div>
            <div className="text-lg font-bold">{eur(gross)}</div>
            <div className="text-xs text-muted-foreground">Platform 20 %: {eur(platformFee)}</div>
          </div>
          <div className="rounded-lg border p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <div className="text-xs text-muted-foreground">Your share (80 %)</div>
            <div className="text-lg font-bold text-purple-700">{eur(artistShare)}</div>
            <div className="text-xs text-muted-foreground">Pending: {eur(profile.pending_balance)}</div>
          </div>
        </div>

        <div className="rounded-lg border divide-y text-sm">
          <div className="flex items-center justify-between p-3">
            <span className="text-muted-foreground">Pending payout</span>
            <span className="font-semibold">{eur(profile.pending_balance)}</span>
          </div>
          <div className="flex items-center justify-between p-3">
            <span className="text-muted-foreground">Already withdrawn</span>
            <span className="font-semibold">{eur(profile.total_withdrawn)}</span>
          </div>
        </div>

        {rows.length > 0 && (
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Platform</TableHead>
                  <TableHead className="text-right">Your 80 %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 25).map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString("sk-SK", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{r.transaction_type.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{eur(r.total_amount)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{eur(r.platform_commission)}</TableCell>
                    <TableCell className="text-right font-semibold text-purple-700">{eur(r.musician_amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConcertEarningsCard;
