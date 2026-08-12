import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Banknote, Loader2, Save, Send } from "lucide-react";

const eur = (n: number) => `€${Number(n || 0).toFixed(2)}`;
const MIN_WITHDRAWAL = 20;

type MethodType = "iban" | "paypal" | "revolut" | "wise";

interface Props {
  musicianId: string;
  pendingBalance: number;
  onChanged?: () => void;
}

interface RequestRow {
  id: string;
  amount: number;
  status: string;
  created_at: string | null;
}

export const MusicianPayoutCard = ({ musicianId, pendingBalance, onChanged }: Props) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [methodId, setMethodId] = useState<string | null>(null);
  const [methodType, setMethodType] = useState<MethodType>("iban");
  const [holder, setHolder] = useState("");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [requests, setRequests] = useState<RequestRow[]>([]);

  const load = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: pm }, { data: wr }] = await Promise.all([
        (supabase as any)
          .from("payout_methods")
          .select("id, method_type, account_holder, account_details")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .limit(1)
          .maybeSingle(),
        (supabase as any)
          .from("musician_withdrawal_requests")
          .select("id, amount, status, created_at")
          .eq("musician_id", musicianId)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      if (pm) {
        setMethodId(pm.id);
        setMethodType((pm.method_type as MethodType) || "iban");
        setHolder(pm.account_holder || "");
        setAccount((pm.account_details as any)?.account || "");
      }
      setRequests((wr as RequestRow[]) || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [musicianId]);

  const saveMethod = async () => {
    if (!holder.trim() || !account.trim()) {
      toast.error("Fill in the account holder and account details");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const payload = {
        user_id: user.id,
        method_type: methodType,
        label: methodType.toUpperCase(),
        account_holder: holder.trim(),
        account_details: { account: account.trim() },
        currency: "EUR",
        is_default: true,
      };
      const { data, error } = methodId
        ? await (supabase as any).from("payout_methods").update(payload).eq("id", methodId).select("id").maybeSingle()
        : await (supabase as any).from("payout_methods").insert(payload).select("id").maybeSingle();
      if (error) throw error;
      if (data?.id) setMethodId(data.id);
      toast.success("Payout details saved");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save payout details");
    } finally {
      setSaving(false);
    }
  };

  const requestWithdrawal = async () => {
    const value = Number(amount);
    if (!holder.trim() || !account.trim()) {
      toast.error("Save your payout details first");
      return;
    }
    if (!value || value < MIN_WITHDRAWAL) {
      toast.error(`Minimum withdrawal is ${eur(MIN_WITHDRAWAL)}`);
      return;
    }
    if (value > pendingBalance) {
      toast.error(`You can withdraw at most ${eur(pendingBalance)}`);
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await (supabase as any).from("musician_withdrawal_requests").insert({
        musician_id: musicianId,
        amount: value,
        status: "pending",
        payment_method: methodType,
        payment_details: { account_holder: holder.trim(), account: account.trim(), currency: "EUR" },
      });
      if (error) throw error;
      toast.success("Withdrawal request sent");
      setAmount("");
      await load();
      onChanged?.();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not send request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  const accountLabel = methodType === "iban" ? "IBAN" : methodType === "paypal" ? "PayPal e-mail" : "Account / phone";

  return (
    <Card className="border-purple-500/30 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <CardTitle className="flex items-center gap-2 text-base">
          <Banknote className="w-5 h-5 text-purple-600" />
          Payout details &amp; withdrawal
          <Badge variant="outline" className="ml-auto border-purple-500/40 text-purple-700">
            Available {eur(pendingBalance)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Method</Label>
            <Select value={methodType} onValueChange={(v) => setMethodType(v as MethodType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="iban">Bank transfer (IBAN)</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="revolut">Revolut</SelectItem>
                <SelectItem value="wise">Wise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Account holder</Label>
            <Input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Full name" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{accountLabel}</Label>
            <Input value={account} onChange={(e) => setAccount(e.target.value)} placeholder={accountLabel} />
          </div>
        </div>
        <Button onClick={saveMethod} disabled={saving} variant="outline" className="w-full sm:w-auto">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save payout details
        </Button>

        <div className="rounded-lg border p-3 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Withdrawal amount (min {eur(MIN_WITHDRAWAL)})</Label>
              <Input
                type="number"
                min={MIN_WITHDRAWAL}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={pendingBalance.toFixed(2)}
              />
            </div>
            <Button onClick={requestWithdrawal} disabled={submitting} className="bg-gradient-to-r from-purple-600 to-pink-600">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Request withdrawal
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Requests are reviewed manually. Once approved the money is sent to the account above and the request is marked as paid.
          </p>
        </div>

        {requests.length > 0 && (
          <div className="rounded-lg border divide-y text-sm">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3">
                <span className="text-muted-foreground">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString("sk-SK") : "—"}
                </span>
                <span className="font-semibold">{eur(r.amount)}</span>
                <Badge variant="outline" className="capitalize">{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MusicianPayoutCard;
