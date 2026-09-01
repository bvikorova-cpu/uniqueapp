import { useEffect, useMemo, useState } from "react";
import { Gift, Loader2, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import {
  GIFT_CATEGORIES,
  GIFT_RARITY_RING,
  giftCategoryIcon,
} from "./giftAssets";
import { GiftVisual } from "./GiftVisual";
import { Input } from "@/components/ui/input";

export interface CatalogGift {
  id: string;
  slug: string;
  name: string;
  category: string;
  price_credits: number;
  rarity: string;
  animation: string;
  image_url: string | null;
  emoji: string | null;
}

interface GiftShopSheetProps {
  /** Chat mode: conversation the gift message is posted into. */
  conversationId?: string | null;
  recipientId?: string | null;
  recipientName?: string;
  /** Post mode: send the gift to the author of this post. */
  postId?: string | null;
  /** Custom trigger (defaults to a round gift icon button). */
  trigger?: React.ReactNode;
  onSent?: () => void;
}

export function GiftShopSheet({
  conversationId,
  recipientId,
  recipientName,
  postId,
  trigger,
  onSent,
}: GiftShopSheetProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [gifts, setGifts] = useState<CatalogGift[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const [{ data: catalog }, { data: session }] = await Promise.all([
        supabase
          .from("gift_catalog")
          .select("id, slug, name, category, price_credits, rarity, animation, image_url, emoji")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase.auth.getSession(),
      ]);

      let credits: number | null = null;
      const uid = session?.session?.user?.id;
      if (uid) {
        const { data } = await supabase
          .from("ai_credits")
          .select("credits_remaining")
          .eq("user_id", uid)
          .maybeSingle();
        credits = data?.credits_remaining ?? 0;
      }

      if (cancelled) return;
      setGifts((catalog as CatalogGift[]) || []);
      setBalance(credits);
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const allFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return gifts.filter((g) => !q || g.name.toLowerCase().includes(q));
  }, [gifts, search]);

  const byCategory = useMemo(() => {
    const q = search.trim().toLowerCase();
    const map: Record<string, CatalogGift[]> = {};
    gifts
      .filter((g) => !q || g.name.toLowerCase().includes(q))
      .forEach((g) => {
      map[g.category] = map[g.category] || [];
        map[g.category].push(g);
      });
    return map;
  }, [gifts, search]);

  const sendGift = async (gift: CatalogGift) => {
    if (!postId && (!conversationId || !recipientId)) {
      toast({ title: "Open a conversation first", variant: "destructive" });
      return;
    }
    if (balance !== null && balance < gift.price_credits) {
      toast({
        title: "Not enough credits",
        description: `${gift.name} costs ${gift.price_credits} credits. You have ${balance}.`,
        variant: "destructive",
      });
      return;
    }

    setSendingId(gift.id);
    const { error } = postId
      ? await supabase.rpc("send_post_gift", {
          p_gift_id: gift.id,
          p_post_id: postId,
        })
      : await supabase.rpc("send_chat_gift", {
          p_gift_id: gift.id,
          p_conversation_id: conversationId as string,
          p_recipient_id: recipientId as string,
        });
    setSendingId(null);

    if (error) {
      const msg = error.message.includes("INSUFFICIENT_CREDITS")
        ? "You don't have enough credits."
        : error.message.includes("CANNOT_GIFT_SELF")
          ? "You can't send a gift to yourself."
          : "Could not send the gift. Please try again.";
      toast({ title: "Gift failed", description: msg, variant: "destructive" });
      return;
    }

    setBalance((b) => (b === null ? b : b - gift.price_credits));
    toast({
      title: `${gift.name} sent!`,
      description: `${recipientName || "They"} received your gift.`,
    });
    setOpen(false);
    onSent?.();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 min-h-10 min-w-10 shrink-0 touch-manipulation rounded-full"
          aria-label="Send a gift"
          title="Send a gift"
        >
          <Gift className="h-4 w-4 text-primary" />
        </Button>
        )}
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[80vh] flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Unique Gifts
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            Send an animated gift{recipientName ? ` to ${recipientName}` : postId ? " to this post" : ""}. The recipient earns
            50% of the value in euros (withdrawable from €20).

          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center justify-between py-2">
          <Badge variant="secondary" className="gap-1">
            <Coins className="h-3.5 w-3.5" />
            {balance === null ? "—" : balance} credits
          </Badge>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gifts…"
            className="h-9 max-w-[180px]"
          />
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="all" className="shrink-0 gap-1.5">
                <Gift className="h-4 w-4" />
                All ({gifts.length})
              </TabsTrigger>
              {GIFT_CATEGORIES.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="shrink-0 gap-1.5">
                  <img
                    src={giftCategoryIcon(c.id)}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="h-5 w-5 object-contain"
                  />
                  {c.label}
                  <span className="text-[10px] text-muted-foreground">
                    {(byCategory[c.id] || []).length}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {[{ id: "all", label: "All" }, ...GIFT_CATEGORIES].map((c) => (

              <TabsContent key={c.id} value={c.id} className="flex-1 min-h-0 mt-2">
                <ScrollArea className="h-full pr-2">
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pb-6">
                    {(c.id === "all" ? allFiltered : byCategory[c.id] || []).map((gift) => {
                      const affordable = balance === null || balance >= gift.price_credits;
                      return (
                        <button
                          key={gift.id}
                          type="button"
                          disabled={sendingId !== null}
                          onClick={() => sendGift(gift)}
                          className={`group relative flex flex-col items-center gap-1 rounded-xl border bg-card/60 p-2 ring-1 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 ${
                            GIFT_RARITY_RING[gift.rarity] || "ring-border"
                          } ${affordable ? "" : "opacity-50"}`}
                        >
                          {sendingId === gift.id && (
                            <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/70">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </span>
                          )}
                          <GiftVisual
                            slug={gift.slug}
                            name={gift.name}
                            emoji={gift.emoji}
                            image_url={gift.image_url}
                            animation={gift.animation}
                            size={56}
                          />
                          <span className="text-[11px] font-semibold leading-tight text-center line-clamp-2">
                            {gift.name}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Coins className="h-3 w-3" />
                            {gift.price_credits}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
