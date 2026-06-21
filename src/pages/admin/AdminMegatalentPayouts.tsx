import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Crown } from "lucide-react";
import { SEO } from "@/components/SEO";

interface Winner {
  id: string;
  user_id: string;
  category: string;
  month: number;
  year: number;
  total_votes: number;
  prize_amount: number;
  paid_at: string | null;
  payout_reference: string | null;
  created_at: string;
}

export default function AdminMegatalentPayouts() {
  const [rows, setRows] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refs, setRefs] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("megatalent_winners")
        .select("id, user_id, category, month, year, total_votes, prize_amount, paid_at, payout_reference, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      setRows((data as Winner[]) || []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load winners");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markPaid = async (id: string) => {
    setBusyId(id);
    try {
      const { error } = await (supabase as any).rpc("admin_mark_megatalent_paid", {
        _winner_id: id,
        _reference: refs[id] || null,
      });
      if (error) throw error;
      toast.success("Marked as paid (80% to creator, 20% platform)");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const pending = rows.filter((r) => !r.paid_at);
  const paid = rows.filter((r) => r.paid_at);

  return (
    <>
      <SEO title="Megatalent Payouts — Admin" description="Release prize payouts for Megatalent winners (80/20 split)." />
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Crown className="h-6 w-6 text-primary" /> Megatalent Payouts
        </h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pending winners ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : pending.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No pending payouts.</p>
            ) : (
              <ul className="space-y-3">
                {pending.map((r) => {
                  const creator = +(Number(r.prize_amount) * 0.8).toFixed(2);
                  const platform = +(Number(r.prize_amount) - creator).toFixed(2);
                  return (
                    <li key={r.id} className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          €{Number(r.prize_amount).toFixed(2)} <span className="text-xs text-muted-foreground">→ creator €{creator} · platform €{platform}</span>
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {r.category} · {r.month}/{r.year} · {r.total_votes} votes · user {r.user_id.slice(0, 8)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Input
                          placeholder="Stripe ref (optional)"
                          value={refs[r.id] || ""}
                          onChange={(e) => setRefs((p) => ({ ...p, [r.id]: e.target.value }))}
                          className="h-8 w-48 text-xs"
                        />
                        <Button size="sm" onClick={() => markPaid(r.id)} disabled={busyId === r.id}>
                          {busyId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark paid"}
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paid ({paid.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {paid.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">None yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {paid.slice(0, 50).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2 rounded border border-border/40 p-2">
                    <span className="truncate">
                      €{Number(r.prize_amount).toFixed(2)} · {r.category} · user {r.user_id.slice(0, 8)}
                    </span>
                    <Badge variant="secondary">{r.payout_reference || "paid"}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
