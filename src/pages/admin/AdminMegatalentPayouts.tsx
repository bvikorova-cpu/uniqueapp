import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Crown } from "lucide-react";
import { SEO } from "@/components/SEO";

interface Payout {
  id: string;
  user_id: string;
  amount_eur: number;
  status: string;
  created_at: string;
  display_name?: string | null;
}

export default function AdminMegatalentPayouts() {
  const [rows, setRows] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasingId, setReleasingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("megatalent_escrow")
        .select("id, user_id, amount_eur, status, created_at")
        .in("status", ["pending", "held"])
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      setRows((data as Payout[]) || []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load payouts");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const release = async (id: string) => {
    setReleasingId(id);
    try {
      const { error } = await supabase.functions.invoke("escrow-release", {
        body: { escrow_id: id },
      });
      if (error) throw error;
      toast.success("Payout released (80/20 split)");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Release failed");
    } finally {
      setReleasingId(null);
    }
  };

  return (
    <>
      <SEO title="Megatalent Payouts — Admin" description="Release escrow funds for Megatalent winners (80/20 split)." />
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Crown className="h-6 w-6 text-primary" /> Megatalent Payouts
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Pending escrow ({rows.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : rows.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No pending payouts.</p>
            ) : (
              <ul className="space-y-3">
                {rows.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">€{Number(r.amount_eur).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        user {r.user_id.slice(0, 8)} · {new Date(r.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary">{r.status}</Badge>
                      <Button
                        size="sm"
                        onClick={() => release(r.id)}
                        disabled={releasingId === r.id}
                      >
                        {releasingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Release 80/20"}
                      </Button>
                    </div>
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
