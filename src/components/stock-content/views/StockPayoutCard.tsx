import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Wallet, Banknote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MIN_PAYOUT = 10;

interface PayoutRow {
  id: string;
  amount: number | string;
  status: string | null;
  payment_method: string;
  created_at: string;
}

const num = (v: unknown) => {
  const n = parseFloat(String(v ?? 0));
  return Number.isFinite(n) ? n : 0;
};

export function StockPayoutCard() {
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [requests, setRequests] = useState<PayoutRow[]>([]);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [iban, setIban] = useState("");
  const [holder, setHolder] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [walletRes, reqRes] = await Promise.all([
      supabase
        .from("wallet_balances")
        .select("balance")
        .eq("user_id", user.id)
        .eq("currency", "EUR")
        .maybeSingle(),
      supabase
        .from("stock_withdrawal_requests")
        .select("id, amount, status, payment_method, created_at")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    setBalance(num(walletRes.data?.balance));
    setRequests((reqRes.data || []) as PayoutRow[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending = requests
    .filter((r) => (r.status || "pending") === "pending")
    .reduce((s, r) => s + num(r.amount), 0);
  const available = Math.max(0, balance - pending);

  const submit = async () => {
    const value = num(amount);
    if (value < MIN_PAYOUT) {
      toast({ title: "Amount too low", description: `Minimum payout is €${MIN_PAYOUT}.`, variant: "destructive" });
      return;
    }
    if (value > available) {
      toast({ title: "Not enough balance", description: `You can request up to €${available.toFixed(2)}.`, variant: "destructive" });
      return;
    }
    if (!iban.trim() || !holder.trim()) {
      toast({ title: "Missing details", description: "Fill in the account holder and IBAN.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    const { error } = await supabase.from("stock_withdrawal_requests").insert({
      creator_id: user.id,
      amount: value,
      payment_method: "iban",
      payment_details: { account_holder: holder.trim(), iban: iban.trim().toUpperCase() },
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Request failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Payout requested", description: `€${value.toFixed(2)} will be sent after review (1–5 business days).` });
    setOpen(false);
    setAmount("");
    load();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Available for payout</p>
            <p className="text-2xl font-black">€{available.toFixed(2)}</p>
            {pending > 0 && (
              <p className="text-xs text-muted-foreground">€{pending.toFixed(2)} pending review</p>
            )}
          </div>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)} disabled={available < MIN_PAYOUT}>
          <Banknote className="w-4 h-4" /> Request payout
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Your 70% share of every sale lands in your EUR wallet automatically. Request a bank transfer from €{MIN_PAYOUT}.
      </p>

      {requests.length > 0 && (
        <div className="space-y-2">
          {requests.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 text-sm">
              <div className="min-w-0">
                <p className="font-medium">€{num(r.amount).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <Badge variant={(r.status || "pending") === "paid" ? "default" : "secondary"}>
                {r.status || "pending"}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request a payout</DialogTitle>
            <DialogDescription>
              Available: €{available.toFixed(2)} · minimum €{MIN_PAYOUT}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="payout-amount">Amount (EUR)</Label>
              <Input
                id="payout-amount"
                type="number"
                min={MIN_PAYOUT}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={available.toFixed(2)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="payout-holder">Account holder</Label>
              <Input id="payout-holder" value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="payout-iban">IBAN</Label>
              <Input id="payout-iban" value={iban} onChange={(e) => setIban(e.target.value)} placeholder="SK00 0000 0000 0000 0000 0000" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Sending..." : "Send request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
