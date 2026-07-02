import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2, ExternalLink } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface PaymentRow {
  id: string;
  amount_cents: number;
  currency: string;
  product_type: string;
  status: string;
  created_at: string;
  stripe_payment_intent_id: string | null;
}

/**
 * Buyer-side payment history with one-click invoice/receipt download via the
 * `get-payment-invoice-url` edge function (returns Stripe-hosted URL).
 */
export function PaymentHistoryCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("payment_records")
        .select("id, amount_cents, currency, product_type, status, created_at, stripe_payment_intent_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) {
        toast({
          title: "Couldn't load payments",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setRows(data || []);
      }
      setLoading(false);
    })();
  }, [user?.id, toast]);

  const openInvoice = async (id: string) => {
    setBusyId(id);
    try {
      const { data, error } = await supabase.functions.invoke("get-payment-invoice-url", {
        body: { paymentRecordId: id },
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (!url) throw new Error("No invoice URL returned");
      window.open(url, "_blank");
    } catch (e: any) {
      toast({
        title: "Invoice unavailable",
        description: e?.message || "Stripe didn't return a hosted invoice for this payment.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Payment History Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Payment History Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Payment History Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Payment history
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No payments yet.
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{r.product_type}</TableCell>
                    <TableCell className="text-right font-mono">
                      {(r.amount_cents / 100).toFixed(2)} {r.currency.toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.status === "paid"
                            ? "default"
                            : r.status === "refunded"
                              ? "outline"
                              : r.status === "disputed"
                                ? "destructive"
                                : "secondary"
                        }
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === r.id || r.status === "pending"}
                        onClick={() => openInvoice(r.id)}
                      >
                        {busyId === r.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ExternalLink className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
