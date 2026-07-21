import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gift, Loader2 } from "lucide-react";

interface GiftItem {
  id: string;
  name: string;
  icon: string | null;
  price: number;
  description: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  creatorId: string;
  creatorName?: string;
}

export function SendGiftDialog({ open, onOpenChange, creatorId, creatorName }: Props) {
  const { toast } = useToast();
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase
        .from("creator_gifts")
        .select("id, name, icon, price, description")
        .eq("is_active", true)
        .order("price", { ascending: true });
      setGifts((data as GiftItem[]) || []);
    })();
  }, [open]);

  const send = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to send a gift.",
          variant: "destructive",
        });
        return;
      }
      const { data, error } = await supabase.functions.invoke("send-creator-gift", {
        body: { creatorId, giftId: selected, message: message.trim() },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      if (data?.url) {
        window.open(data.url, "_blank");
        onOpenChange(false);
        setSelected(null);
        setMessage("");
      }
    } catch (e: any) {
      toast({
        title: "Gift failed",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const picked = gifts.find((g) => g.id === selected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Send a gift{creatorName ? ` to ${creatorName}` : ""}
          </DialogTitle>
          <DialogDescription>
            Support the creator with a virtual gift. 90% goes directly to them.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          {gifts.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelected(g.id)}
              className={`p-3 rounded-lg border-2 transition-all text-center hover:border-primary/50 ${
                selected === g.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              }`}
            >
              <div className="text-3xl">{g.icon ?? "🎁"}</div>
              <div className="text-xs font-medium mt-1 truncate">{g.name}</div>
              <div className="text-xs text-primary font-semibold">€{g.price}</div>
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Add a message (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={280}
          rows={3}
        />
        <p className="text-xs text-muted-foreground text-right">{message.length}/280</p>

        <Button
          onClick={send}
          disabled={!selected || loading}
          className="w-full"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Gift className="h-4 w-4 mr-2" />
          )}
          {picked ? `Send ${picked.icon} for €${picked.price}` : "Choose a gift"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
