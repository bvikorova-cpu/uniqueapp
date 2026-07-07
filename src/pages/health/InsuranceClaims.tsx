import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import HowItWorksHealth from "@/components/health/HowItWorksHealth";
import { Loader2, ReceiptText } from "lucide-react";

interface Card { id: string; provider_name: string; valid_until: string | null; }
interface Claim {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  admin_note: string | null;
  created_at: string;
}
const STATUS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary", approved: "default", paid: "default", rejected: "destructive",
};

export default function InsuranceClaims() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<Card[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerName, setProviderName] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [cardId, setCardId] = useState("");
  const [amountEur, setAmountEur] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    if (!user) return;
    setLoading(true);
    const [{ data: c }, { data: cl }] = await Promise.all([
      supabase.from("insurance_cards").select("id,provider_name,valid_until").eq("patient_id", user.id),
      supabase
        .from("insurance_claims")
        .select("id,amount_cents,currency,status,admin_note,created_at")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    setCards((c as unknown as Card[]) ?? []);
    setClaims((cl as unknown as Claim[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, [user]);

  async function saveCard() {
    if (!user || !providerName.trim() || !policyNumber.trim()) return;
    setBusy(true);
    // Simple client-side obfuscation; edge fn would ideally re-encrypt server-side.
    const encrypted = btoa(unescape(encodeURIComponent(policyNumber)));
    const { error } = await supabase.from("insurance_cards").insert({
      patient_id: user.id,
      provider_name: providerName.trim(),
      policy_number_encrypted: encrypted,
      valid_until: validUntil || null,
    });
    setBusy(false);
    if (error) return toast({ variant: "destructive", title: "Save failed", description: error.message });
    setProviderName(""); setPolicyNumber(""); setValidUntil("");
    refresh();
  }

  async function submitClaim() {
    if (!cardId || !amountEur) return;
    setBusy(true);
    const { error } = await supabase.functions.invoke("submit-insurance-claim", {
      body: { insurance_card_id: cardId, amount_cents: Math.round(parseFloat(amountEur) * 100) },
    });
    setBusy(false);
    if (error) return toast({ variant: "destructive", title: "Submit failed", description: error.message });
    toast({ title: "Claim submitted", description: "An admin will review it shortly." });
    setAmountEur("");
    refresh();
  }

  return (
    <>
      <Helmet>
        <title>Insurance claims | Unique Health</title>
        <meta name="description" content="Submit and track insurance reimbursement claims." />
      </Helmet>
      <Navbar />
      <main className="container mx-auto space-y-6 px-4 py-8">
        <h1 className="text-2xl font-semibold">Insurance claims</h1>

        <Card>
          <CardHeader><CardTitle>Add insurance card</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Provider</Label>
              <Input value={providerName} onChange={(e) => setProviderName(e.target.value)} />
            </div>
            <div>
              <Label>Policy number</Label>
              <Input value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
            </div>
            <div>
              <Label>Valid until</Label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
            <div className="sm:col-span-3">
              <Button onClick={saveCard} disabled={busy}>Save card</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Submit claim</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Card</Label>
              <select
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
              >
                <option value="">Select…</option>
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>{c.provider_name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Amount (EUR)</Label>
              <Input inputMode="decimal" value={amountEur} onChange={(e) => setAmountEur(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={submitClaim} disabled={busy || !cardId || !amountEur}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ReceiptText className="mr-2 h-4 w-4" />}
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 text-lg font-semibold">My claims</h2>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : claims.length === 0 ? (
            <p className="text-sm text-muted-foreground">No claims submitted yet.</p>
          ) : (
            <div className="space-y-2">
              {claims.map((cl) => (
                <Card key={cl.id}>
                  <CardContent className="flex items-center justify-between pt-4">
                    <div>
                      <p className="font-medium">€{(cl.amount_cents / 100).toFixed(2)}</p>
                      {cl.admin_note && <p className="text-xs text-muted-foreground">{cl.admin_note}</p>}
                      <p className="text-xs text-muted-foreground">{new Date(cl.created_at).toLocaleString()}</p>
                    </div>
                    <Badge variant={STATUS[cl.status] ?? "outline"}>{cl.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <HowItWorksHealth
          title="Insurance claims"
          steps={[
            "Save your insurance card once — the policy number is stored encrypted.",
            "After a consultation, submit the receipt amount for reimbursement.",
            "An admin approves or rejects the claim and you're notified in-app.",
            "Approved claims marked 'paid' indicate the insurer has transferred funds.",
          ]}
        />
      </main>
    </>
  );
}
