import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Coins, Clock, Layers, Loader2, Users, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCardImage } from "@/lib/downloadCardImage";
import type { CardCategory, CollectibleCard } from "./CardCategoryCollection";

const RARITY_LABEL: Record<string, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  mythic: "Mythic",
  prime: "Prime",
};

const RARITY_STYLE: Record<string, string> = {
  common: "bg-muted text-muted-foreground",
  rare: "bg-sky-500/15 text-sky-500 border-sky-500/40",
  epic: "bg-violet-500/15 text-violet-500 border-violet-500/40",
  legendary: "bg-orange-500/15 text-orange-500 border-orange-500/40",
  mythic: "bg-fuchsia-500/15 text-fuchsia-500 border-fuchsia-500/40",
  prime: "bg-amber-400/20 text-amber-500 border-amber-400/50",
};

interface Props {
  card: CollectibleCard | null;
  category: CardCategory;
  totalCards: number;
  onClose: () => void;
}

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : null;

/** Full-detail view of a single collectible card: rarity, set, full-quality art and acquisition history. */
export const CardDetailModal = ({ card, category, totalCards, onClose }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["card-detail", card?.id],
    enabled: !!card,
    staleTime: 30 * 1000,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const [mine, owners] = await Promise.all([
        user
          ? supabase
              .from("user_card_collection")
              .select("copies, credits_spent, created_at, updated_at")
              .eq("user_id", user.id)
              .eq("collectible_id", card!.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        supabase
          .from("user_card_collection")
          .select("id", { count: "exact", head: true })
          .eq("collectible_id", card!.id),
      ]);
      return {
        mine: (mine as { data: { copies: number; credits_spent: number | null; created_at: string; updated_at: string } | null }).data,
        owners: (owners as { count: number | null }).count ?? 0,
      };
    },
  });

  const owned = (data?.mine?.copies ?? 0) > 0;

  return (
    <Dialog open={!!card} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        {card && (
          <>
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-black">{card.name}</DialogTitle>
              <DialogDescription className="capitalize">
                {card.subject} · {category.name} · card #{card.card_index} of {totalCards}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 sm:grid-cols-[minmax(0,300px)_1fr]">
              <div className="space-y-3">
                <div className={`relative aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-br ${card.gradient}`}>
                  {card.image_url ? (
                    <img
                      src={card.image_url}
                      alt={`${card.name} — ${category.name} collectible card artwork`}
                      className={`absolute inset-0 w-full h-full object-cover ${owned ? "" : "opacity-75 saturate-[0.6]"}`}
                      decoding="async"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-7xl">{card.emoji}</div>
                  )}
                  {!owned && (
                    <div className="absolute inset-x-0 bottom-0 bg-background/85 py-1.5 text-center text-[11px] font-bold backdrop-blur">
                      Not collected yet
                    </div>
                  )}
                </div>

                {card.image_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => downloadCardImage(card.image_url!, `${category.name}-${card.name}`)}
                  >
                    <Download className="h-4 w-4" /> Download card image
                  </Button>
                )}
              </div>



              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={RARITY_STYLE[card.rarity] ?? "bg-muted"}>
                    {RARITY_LABEL[card.rarity] ?? card.rarity}
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-border/40">
                    <Layers className="h-3 w-3" /> Set: {category.emoji} {category.name}
                  </Badge>
                  <Badge variant="outline" className="border-border/40">{card.code}</Badge>
                  {card.is_prime && (
                    <Badge className="gap-1 bg-gradient-to-r from-amber-400 to-yellow-600 text-white">
                      <Sparkles className="h-3 w-3" /> Prime
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{card.lore}</p>

                {card.stats && Object.keys(card.stats).length > 0 && (
                  <div>
                    <h4 className="text-sm font-black mb-2">Battle attributes</h4>
                    <div className="space-y-1.5">
                      {Object.entries(card.stats as Record<string, number>).map(([k, raw]) => {
                        const value = Number(raw) || 0;
                        return (
                          <div key={k} className="flex items-center gap-2">
                            <span className="w-24 text-[11px] font-bold capitalize">{k.replace(/_/g, " ")}</span>
                            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${card.gradient}`}
                                style={{ width: `${Math.min(100, value)}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-[11px] font-black">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}


                <Separator />


                <div>
                  <h4 className="text-sm font-black mb-2">Acquisition history</h4>
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading your history…
                    </div>
                  ) : owned ? (
                    <ul className="space-y-2 text-xs">
                      <li className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="font-bold text-emerald-500">Copies owned: ×{data?.mine?.copies}</span>
                      </li>
                      <li className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> First collected: {fmt(data?.mine?.created_at) ?? "—"}
                      </li>
                      <li className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> Last copy added: {fmt(data?.mine?.updated_at) ?? "—"}
                      </li>
                      <li className="flex items-center gap-2 text-muted-foreground">
                        <Coins className="h-3.5 w-3.5" /> Credits spent on this card: {data?.mine?.credits_spent ?? 0}
                      </li>
                      <li className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" /> Collectors who own it: {data?.owners}
                      </li>
                    </ul>
                  ) : (
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>You have not collected this card yet — draw in this category for a chance to find it.</p>
                      <p className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" /> Collectors who own it: {data?.owners ?? 0}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CardDetailModal;
