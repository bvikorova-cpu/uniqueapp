import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ReconcileResult {
  date: string;
  summary: {
    stripe_charges: number;
    db_records: number;
    missing_in_db: number;
    missing_in_stripe: number;
    amount_mismatch: number;
    status_mismatch: number;
  };
  missing_in_db: any[];
  missing_in_stripe: any[];
  amount_mismatch: any[];
  status_mismatch: any[];
}

const yesterday = () => {
  const d = new Date(Date.now() - 24 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
};

export default function AdminReconciliation() {
  const { toast } = useToast();
  const [date, setDate] = useState(yesterday());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReconcileResult | null>(null);

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        "admin-reconcile-payments",
        { body: { date } },
      );
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as ReconcileResult);
      toast({ title: "Reconciliation complete", description: `Date: ${date}` });
    } catch (e: any) {
      toast({
        title: "Reconciliation failed",
        description: e.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalIssues =
    (result?.summary.missing_in_db ?? 0) +
    (result?.summary.missing_in_stripe ?? 0) +
    (result?.summary.amount_mismatch ?? 0) +
    (result?.summary.status_mismatch ?? 0);

  return (
    <>
      <Helmet>
        <title>Payment Reconciliation — Admin</title>
        <meta
          name="description"
          content="Daily Stripe vs ledger reconciliation dashboard."
        />
      </Helmet>

      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Payment Reconciliation</h1>
          <p className="text-muted-foreground mt-1">
            Compare Stripe charges with the internal payment ledger for any day.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Run reconciliation
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="date">Date (UTC)</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={yesterday()}
              />
            </div>
            <Button onClick={run} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running…
                </>
              ) : (
                "Run"
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard label="Stripe charges" value={result.summary.stripe_charges} />
              <StatCard label="DB records" value={result.summary.db_records} />
              <StatCard
                label="Missing in DB"
                value={result.summary.missing_in_db}
                bad={result.summary.missing_in_db > 0}
              />
              <StatCard
                label="Missing in Stripe"
                value={result.summary.missing_in_stripe}
                bad={result.summary.missing_in_stripe > 0}
              />
              <StatCard
                label="Amount mismatch"
                value={result.summary.amount_mismatch}
                bad={result.summary.amount_mismatch > 0}
              />
              <StatCard
                label="Status mismatch"
                value={result.summary.status_mismatch}
                bad={result.summary.status_mismatch > 0}
              />
            </div>

            {totalIssues === 0 ? (
              <Card className="border-primary/40 bg-primary/5">
                <CardContent className="py-6 flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold">All reconciled.</p>
                    <p className="text-sm text-muted-foreground">
                      Stripe and the ledger match perfectly for {result.date}.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Mismatches ({totalIssues})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="missing_db">
                    <TabsList className="flex flex-wrap">
                      <TabsTrigger value="missing_db">
                        Missing in DB ({result.summary.missing_in_db})
                      </TabsTrigger>
                      <TabsTrigger value="missing_stripe">
                        Missing in Stripe ({result.summary.missing_in_stripe})
                      </TabsTrigger>
                      <TabsTrigger value="amount">
                        Amount ({result.summary.amount_mismatch})
                      </TabsTrigger>
                      <TabsTrigger value="status">
                        Status ({result.summary.status_mismatch})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="missing_db">
                      <IssueList rows={result.missing_in_db} />
                    </TabsContent>
                    <TabsContent value="missing_stripe">
                      <IssueList rows={result.missing_in_stripe} />
                    </TabsContent>
                    <TabsContent value="amount">
                      <IssueList rows={result.amount_mismatch} />
                    </TabsContent>
                    <TabsContent value="status">
                      <IssueList rows={result.status_mismatch} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  bad,
}: {
  label: string;
  value: number;
  bad?: boolean;
}) {
  return (
    <Card className={bad ? "border-destructive/50" : ""}>
      <CardContent className="py-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <p
          className={`text-2xl font-bold mt-1 ${
            bad ? "text-destructive" : ""
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function IssueList({ rows }: { rows: any[] }) {
  if (!rows.length) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Nothing here — all clean.
      </p>
    );
  }
  return (
    <ScrollArea className="h-[400px] mt-3">
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div
            key={i}
            className="border border-border/50 rounded-md p-3 text-xs font-mono bg-muted/20"
          >
            {Object.entries(r).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-muted-foreground min-w-[140px]">{k}:</span>
                <span className="break-all">{String(v)}</span>
              </div>
            ))}
            <div className="mt-2 flex gap-2">
              {r.payment_intent && (
                <Badge variant="outline" className="text-[10px]">
                  <a
                    href={`https://dashboard.stripe.com/payments/${r.payment_intent}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Stripe ↗
                  </a>
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
