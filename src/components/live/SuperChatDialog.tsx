import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSuperChats } from "@/hooks/useSuperChats";

const TIERS = [200, 500, 1000, 2000, 5000];

interface Props {
  streamId: string;
}

export const SuperChatDialog = ({ streamId }: Props) => {
  const { sendSuperChat } = useSuperChats(streamId);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(500);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    sendSuperChat({ amountCents: amount, message: message.trim() || undefined });
    setMessage("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" className="gap-1 bg-gradient-to-r from-amber-500 to-pink-500 hover:opacity-90">
          <Sparkles className="h-4 w-4" /> Super Chat
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send a Super Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {TIERS.map((cents) => (
              <button
                key={cents}
                onClick={() => setAmount(cents)}
                className={`p-2 rounded-md border text-sm font-bold transition ${
                  amount === cents ? "border-primary bg-primary/20" : "border-border hover:border-primary/50"
                }`}
              >
                €{(cents / 100).toFixed(2)}
              </button>
            ))}
          </div>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional message..."
            maxLength={200}
          />
          <Button onClick={handleSend} className="w-full gap-2">
            <Send className="h-4 w-4" /> Send €{(amount / 100).toFixed(2)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
