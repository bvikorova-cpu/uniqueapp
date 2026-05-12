import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PRESETS = [10, 25, 60, 150];

export function GiftCreditsDialog() {
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState(25);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const price = credits * 0.4;

  const send = async () => {
    if (!email) return toast({ title: "Recipient email required", variant: "destructive" });
    setLoading(true);
    try {
      const code = `GIFT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const { error: insErr } = await supabase.from("ai_credit_gifts").insert({
        code, sender_id: user.id, recipient_email: email, credits, amount_cents: Math.round(price * 100), message,
      });
      if (insErr) throw insErr;
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          product: "ai_credits_gift",
          amount: Math.round(price * 100),
          productName: `Gift ${credits} AI Credits → ${email}`,
          mode: "payment",
          metadata: { gift_code: code, credits: String(credits), recipient: email },
          successUrl: `${window.location.origin}/ai-credits-store?payment=success&gift=${code}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/ai-credits-store?payment=canceled`,
        },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank", "noopener,noreferrer");
      setOpen(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2"><Gift className="h-4 w-4" /> Gift credits</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Gift AI Credits</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Amount</Label>
            <div className="flex gap-2 mt-2">
              {PRESETS.map((p) => (
                <Button key={p} type="button" variant={credits === p ? "default" : "outline"} size="sm" onClick={() => setCredits(p)}>{p}</Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Recipient email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="friend@example.com" />
          </div>
          <div>
            <Label>Personal message (optional)</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={200} rows={2} />
          </div>
          <div className="flex justify-between items-center bg-muted p-3 rounded-lg">
            <span className="text-sm">Total</span>
            <span className="text-2xl font-black">€{price.toFixed(2)}</span>
          </div>
          <Button className="w-full" disabled={loading} onClick={send}>
            {loading ? "Processing..." : "Send gift"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
