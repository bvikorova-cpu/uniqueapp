import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { shadowArenaCall } from "@/hooks/useShadowArenaRouter";
import { toast } from "sonner";

interface CatalogItem {
  id: string; code: string; name: string; emoji: string;
  tier: string; credit_cost: number;
}

const TIER_COLOR: Record<string, string> = {
  common: "border-zinc-700/60",
  rare: "border-blue-500/60",
  epic: "border-purple-500/60",
  legendary: "border-amber-500/60",
};

export function StoryGiftPicker({ recipientId, storyId }: { recipientId?: string | null; storyId: string }) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [flying, setFlying] = useState<{ emoji: string; key: number } | null>(null);
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    if (!open || items.length) return;
    supabase.from("shadow_gift_catalog").select("*").eq("is_active", true)
      .order("credit_cost", { ascending: true })
      .then(({ data }) => setItems((data as CatalogItem[]) || []));
  }, [open, items.length]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  const isOwn = !!me && !!recipientId && me === recipientId;

  const send = async (g: CatalogItem) => {
    if (!recipientId) { toast.error("This story's author is anonymous — gifts are disabled."); return; }
    if (isOwn) { toast.error("You can't send gifts to your own story."); return; }
    setSending(g.code);
    try {
      await shadowArenaCall("gift_send", {
        gift_code: g.code,
        recipient_id: recipientId,
        context_type: "story",
        context_id: storyId,
      });
      setFlying({ emoji: g.emoji, key: Date.now() });
      toast.success(`${g.emoji} ${g.name} sent to the author!`);
      setTimeout(() => setFlying(null), 1500);
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message === "insufficient_credits" ? "Not enough credits." : (e?.message || "Could not send gift"));
    } finally {
      setSending(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1 border-pink-800/40 text-pink-400 hover:bg-pink-950/30"
          onClick={(e) => e.stopPropagation()}
        >
          <Gift className="w-4 h-4" />
          <span className="text-xs">Send gift</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 text-xs text-muted-foreground">
          Gifts replace likes — they support the author and count as votes.
        </div>
        {!recipientId ? (
          <p className="text-sm text-muted-foreground">Anonymous author — gifts unavailable.</p>
        ) : isOwn ? (
          <p className="text-sm text-muted-foreground">This is your story.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 relative">
            {items.map((g) => (
              <button
                key={g.id}
                onClick={() => send(g)}
                disabled={sending === g.code}
                className={`rounded-lg border ${TIER_COLOR[g.tier] ?? "border-border"} p-2 bg-muted/30 hover:bg-pink-950/20 transition active:scale-95 disabled:opacity-50`}
              >
                <div className="text-xl">{g.emoji}</div>
                <div className="text-[9px] text-muted-foreground truncate">{g.name}</div>
                <div className="text-[10px] font-bold text-amber-500">{g.credit_cost}c</div>
              </button>
            ))}
            {flying && (
              <div key={flying.key} className="pointer-events-none absolute inset-0 flex items-center justify-center text-5xl animate-[ping_1.5s_ease-out]">
                {flying.emoji}
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
