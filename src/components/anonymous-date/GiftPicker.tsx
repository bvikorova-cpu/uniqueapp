import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Gift, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLiveAiCredits } from "@/hooks/useLiveAiCredits";

const GIFT_COST = 10;

const GIFTS = [
  { emoji: "🌹", label: "Rose" },
  { emoji: "🎁", label: "Gift box" },
  { emoji: "🧸", label: "Teddy" },
  { emoji: "🍫", label: "Chocolate" },
  { emoji: "🍰", label: "Cake" },
  { emoji: "☕", label: "Coffee" },
  { emoji: "🥂", label: "Cheers" },
  { emoji: "💐", label: "Bouquet" },
  { emoji: "💎", label: "Diamond" },
  { emoji: "🎶", label: "Song" },
  { emoji: "🌙", label: "Goodnight" },
  { emoji: "💖", label: "Heart" },
];

interface Props {
  matchId: string;
  disabled?: boolean;
}

/** Sends a virtual gift as a chat message. Server-side RPC charges 10 credits atomically. */
export const GiftPicker = ({ matchId, disabled }: Props) => {
  const { toast } = useToast();
  const { credits, refresh } = useLiveAiCredits();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const send = async (gift: { emoji: string; label: string }) => {
    if (sending) return;
    setSending(true);
    const { data, error } = await supabase.rpc("anon_date_send_gift", {
      _match_id: matchId,
      _gift: `${gift.emoji} ${gift.label}`,
    });
    setSending(false);

    const res = (data ?? {}) as { success?: boolean; error?: string };
    if (error || !res.success) {
      const code = res.error ?? error?.message ?? "UNKNOWN";
      toast({
        title: code === "INSUFFICIENT_CREDITS" ? "Not enough credits" : "Gift failed",
        description:
          code === "INSUFFICIENT_CREDITS"
            ? `You need ${GIFT_COST} credits to send a gift.`
            : code,
        variant: "destructive",
      });
      return;
    }

    setOpen(false);
    refresh();
    window.dispatchEvent(new Event("ai-credits-updated"));
    toast({ title: `${gift.emoji} Gift sent!`, description: `${GIFT_COST} credits used.` });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="outline"
          disabled={disabled || sending}
          title={`Send a gift · ${GIFT_COST} credits`}
          className="rounded-full shrink-0"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4 text-primary" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold">Send a gift</p>
          <span className="text-[10px] text-muted-foreground">{GIFT_COST} cr · you have {credits}</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {GIFTS.map((g) => (
            <button
              key={g.emoji}
              type="button"
              onClick={() => send(g)}
              disabled={sending || credits < GIFT_COST}
              className="flex flex-col items-center gap-0.5 rounded-lg p-2 hover:bg-muted disabled:opacity-40"
            >
              <span className="text-xl">{g.emoji}</span>
              <span className="text-[8px] text-muted-foreground">{g.label}</span>
            </button>
          ))}
        </div>
        {credits < GIFT_COST && (
          <p className="mt-2 text-[10px] text-destructive font-semibold">
            You need {GIFT_COST} credits to send a gift.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
};
