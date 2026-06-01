import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Coins, Gift, ArrowLeft, History, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

interface GiftResult {
  recipient_id: string;
  amount: number;
  sender_balance_after: number;
  message: string | null;
}

export default function CreditGifts() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState<string>("10");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<GiftResult | null>(null);

  const loadBalance = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      navigate("/auth");
      return;
    }
    const { data } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", u.user.id)
      .maybeSingle();
    setBalance(data?.credits_remaining ?? 0);
  };

  useEffect(() => {
    loadBalance();
  }, []);

  const send = async () => {
    const n = parseInt(amount, 10);
    if (!email.trim() || !email.includes("@")) {
      toast.error("Zadaj platný email príjemcu");
      return;
    }
    if (!Number.isFinite(n) || n < 1 || n > 1000) {
      toast.error("Suma musí byť 1–1000 CR");
      return;
    }
    if (balance !== null && balance < n) {
      toast.error("Nedostatok kreditov");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.rpc("send_credit_gift", {
        p_recipient_email: email.trim(),
        p_amount: n,
        p_message: message.trim() || null,
      });
      if (error) throw error;
      const r = data as unknown as GiftResult;
      setLastResult(r);
      setBalance(r.sender_balance_after);
      toast.success(`Darček odoslaný: ${n} CR`, { description: email });
      setEmail("");
      setMessage("");
    } catch (e: any) {
      const msg = e.message || "Chyba pri odoslaní";
      if (msg.includes("Recipient not found")) {
        toast.error("Príjemca nenájdený", { description: "Skontroluj email." });
      } else if (msg.includes("Cannot gift yourself")) {
        toast.error("Nemôžeš poslať darček sám sebe");
      } else if (msg.includes("Insufficient credits")) {
        toast.error("Nedostatok kreditov");
      } else {
        toast.error(msg);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Kreditové darčeky | Unique"
        description="Pošli kredity inému používateľovi ako darček."
        canonical="/credit-gifts"
      />
      <div className="container max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Späť
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/credits/history")}>
            <History className="h-4 w-4 mr-2" /> História
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <Gift className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Kreditové darčeky</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          Pošli 1–1000 CR inému používateľovi. Transakcia sa zaznamená do tvojej{" "}
          <button
            className="underline"
            onClick={() => navigate("/credits/history")}
          >
            histórie kreditov
          </button>
          .
        </p>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 text-sm">
            <Coins className="h-4 w-4 text-primary" />
            <span>Tvoj zostatok:</span>
            <strong>{balance ?? "—"} CR</strong>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient">Email príjemcu</Label>
              <Input
                id="recipient"
                type="email"
                placeholder="priatel@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={sending}
              />
            </div>

            <div>
              <Label htmlFor="amount">Suma (CR)</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                max={1000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={sending}
              />
            </div>

            <div>
              <Label htmlFor="message">Správa (voliteľné)</Label>
              <Textarea
                id="message"
                placeholder="Veselé Vianoce!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending}
                maxLength={280}
                rows={3}
              />
            </div>

            <Button
              onClick={send}
              disabled={sending || balance === null}
              className="w-full"
              size="lg"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Odosielam…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Poslať darček
                </>
              )}
            </Button>
          </div>

          {lastResult && (
            <div className="mt-6 p-4 rounded-lg bg-muted text-sm">
              <div className="font-medium">Posledný darček odoslaný</div>
              <div className="text-muted-foreground mt-1">
                {lastResult.amount} CR · Zostatok: <strong>{lastResult.sender_balance_after} CR</strong>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
