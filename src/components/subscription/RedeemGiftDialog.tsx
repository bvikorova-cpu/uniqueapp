import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ticket, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const RedeemGiftDialog = () => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const redeem = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("gift-subscription", {
        body: { action: "redeem", code: code.trim().toUpperCase() },
      });
      if (error) throw error;
      toast.success(`Redeemed! ${data.tier} for ${data.months} months.`);
      setOpen(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2"><Ticket className="h-4 w-4" /> Redeem gift code</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Redeem a gift code</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Input placeholder="GIFT-XXXXXXXX" value={code} onChange={e => setCode(e.target.value)} className="uppercase font-mono" />
          <Button className="w-full" onClick={redeem} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Redeem"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
