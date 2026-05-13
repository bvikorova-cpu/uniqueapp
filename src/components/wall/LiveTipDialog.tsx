import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function LiveTipDialog({ livePostId, streamerId }: { livePostId: string; streamerId: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("5");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const tip = async () => {
    setLoading(true);
    try {
      const cents = Math.round(parseFloat(amount) * 100);
      if (!cents || cents < 50) throw new Error("Min tip €0.50");
      const { data, error } = await supabase.functions.invoke("tip-stream", {
        body: { livePostId, streamerId, amountCents: cents, message },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast({ title: "Tip failed", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Gift className="h-4 w-4" /> Tip
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Send a tip</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            {["1", "5", "10", "25"].map((v) => (
              <Button key={v} variant={amount === v ? "default" : "outline"} size="sm" onClick={() => setAmount(v)}>€{v}</Button>
            ))}
          </div>
          <Input type="number" min="0.5" step="0.5" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (EUR)" />
          <Textarea placeholder="Message (optional)" value={message} onChange={(e) => setMessage(e.target.value)} rows={2} maxLength={200} />
          <Button className="w-full" onClick={tip} disabled={loading}>
            {loading ? "Processing…" : `Tip €${amount}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
