import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const GiftSubscriptionDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("premium");
  const [months, setMonths] = useState("1");
  const [message, setMessage] = useState("");

  const send = async () => {
    if (!email.includes("@")) return toast.error("Valid email required");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("gift-subscription", {
        body: { action: "create", recipient_email: email, tier, months: Number(months), message },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2"><Gift className="h-4 w-4" /> Gift a subscription</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Gift a subscription</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Recipient email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Plan</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic — €9.99/mo</SelectItem>
                  <SelectItem value="premium">Premium — €19.99/mo</SelectItem>
                  <SelectItem value="business">Business — €49.99/mo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Duration</Label>
              <Select value={months} onValueChange={setMonths}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1,3,6,12].map(m => <SelectItem key={m} value={String(m)}>{m} {m===1?'month':'months'}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Personal message (optional)</Label><Textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={300} /></div>
          <Button className="w-full" onClick={send} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Gift className="h-4 w-4 mr-2" />}
            Continue to checkout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
