import { motion } from "framer-motion";
import { Coffee, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TipJarProps {
  recipientId: string;
  recipientName: string;
  currentUserId: string | null;
}

export const TipJar = ({ recipientId, recipientName, currentUserId }: TipJarProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("3");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendTip = async () => {
    if (!currentUserId) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("profile_tips").insert({
      sender_id: currentUserId,
      recipient_id: recipientId,
      amount: Number(amount),
      message,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Tip failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tip sent!", description: `Thanks for supporting ${recipientName}` });
      setOpen(false);
      setMessage("");
    }
  };

  if (currentUserId === recipientId) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30"
        >
          <Coffee className="h-4 w-4" />
          Tip
        </motion.button>
      </DialogTrigger>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-amber-400/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-amber-400" />
            Tip {recipientName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {["1", "3", "5", "10"].map((v) => (
              <Button
                key={v}
                variant={amount === v ? "default" : "outline"}
                onClick={() => setAmount(v)}
                className={amount === v ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold" : ""}
              >
                €{v}
              </Button>
            ))}
          </div>
          <Input type="number" placeholder="Custom amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Textarea placeholder="Optional message…" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
          <Button onClick={sendTip} disabled={loading || !amount} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black">
            {loading ? "Sending…" : `Send €${amount} tip`}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">Demo flow — Stripe Connect integration ready to be enabled.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
