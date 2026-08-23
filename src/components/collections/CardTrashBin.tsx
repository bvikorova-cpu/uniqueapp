import { cardThumbUrl } from "@/lib/cardImageUrl";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Recycle, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

const RECYCLE_BATCH = 10;

interface TrashRow {
  id: string;
  collectible_id: string;
  created_at: string;
  card: {
    name: string;
    emoji: string;
    gradient: string;
    rarity: string;
    card_index: number;
    image_url: string | null;
  } | null;
}

interface Props {
  /** Limit the bin to a single collection; omit to show every discarded card. */
  category?: string;
}

/** Recycle bin for discarded collectible cards — 10 cards = +1 AI credit. */
export const CardTrashBin = ({ category }: Props) => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [recycling, setRecycling] = useState(false);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["card-trash", category ?? "all"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [] as TrashRow[];
      let q = supabase
        .from("user_card_trash")
        .select("id, collectible_id, created_at, card:card_collectibles(name, emoji, gradient, rarity, card_index, image_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500);
      if (category) q = q.eq("category_slug", category);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as TrashRow[];
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= RECYCLE_BATCH) {
        toast.info(`You can recycle exactly ${RECYCLE_BATCH} cards at a time.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const selectFirstTen = () => setSelected(rows.slice(0, RECYCLE_BATCH).map((r) => r.id));

  const recycle = async () => {
    if (selected.length !== RECYCLE_BATCH) return;
    setRecycling(true);
    try {
      const { data, error } = await (supabase as any).rpc("card_trash_recycle", { _trash_ids: selected });
      if (error) throw error;
      toast.success(`${RECYCLE_BATCH} cards destroyed — +1 AI credit added (balance ${data?.balance ?? "updated"}).`);
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ["card-trash"] });
      window.dispatchEvent(new Event("ai-credits-updated"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Recycling failed, please try again.");
    } finally {
      setRecycling(false);
    }
  };

  const canRecycle = useMemo(() => selected.length === RECYCLE_BATCH, [selected]);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 border-border/30 bg-card/80 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center">
            <Trash2 className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-base">Discarded cards</h3>
            <p className="text-xs text-muted-foreground">
              Cards you rejected stay here. Pick exactly {RECYCLE_BATCH} and recycle them for +1 AI credit — they are destroyed permanently.
            </p>
          </div>
          <Badge variant="outline" className="ml-auto border-border/40">{rows.length} in bin</Badge>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button onClick={recycle} disabled={!canRecycle || recycling} className="gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white">
            {recycling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Recycle className="h-4 w-4" />}
            {recycling ? "Recycling…" : `Recycle ${selected.length}/${RECYCLE_BATCH} for 1 credit`}
          </Button>
          <Button variant="outline" onClick={selectFirstTen} disabled={rows.length < RECYCLE_BATCH}>
            Select first {RECYCLE_BATCH}
          </Button>
          {selected.length > 0 && (
            <Button variant="ghost" onClick={() => setSelected([])}>Clear selection</Button>
          )}
        </div>
        {rows.length < RECYCLE_BATCH && (
          <p className="text-[11px] text-muted-foreground mt-2">
            You need at least {RECYCLE_BATCH} discarded cards to recycle ({RECYCLE_BATCH - rows.length} more to go).
          </p>
        )}
      </Card>

      {rows.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-border/40 bg-card/70">
          <p className="font-bold mb-1">Your bin is empty</p>
          <p className="text-xs text-muted-foreground">Cards you reject with ✗ land here instead of disappearing.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {rows.map((r) => {
            const isSel = selected.includes(r.id);
            return (
              <Card
                key={r.id}
                role="button"
                tabIndex={0}
                onClick={() => toggle(r.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(r.id); } }}
                className={`overflow-hidden cursor-pointer transition-all bg-card/90 ${isSel ? "border-2 border-emerald-500 scale-[1.02]" : "border-border/30 hover:border-primary/40"}`}
              >
                <div className={`relative aspect-[4/5] bg-gradient-to-br ${r.card?.gradient ?? "from-slate-500 to-slate-700"}`}>
                  {r.card?.image_url ? (
                    <img
                      src={cardThumbUrl(r.card.image_url)}
                      alt={`${r.card.name} discarded collectible card`}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 saturate-[0.7]"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">{r.card?.emoji ?? "🃏"}</div>
                  )}
                  {isSel && (
                    <div className="absolute inset-0 bg-emerald-500/25 flex items-center justify-center">
                      <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-bold truncate">{r.card?.name ?? "Card"}</p>
                  <p className="text-[10px] text-muted-foreground truncate capitalize">
                    #{r.card?.card_index ?? "?"} · {r.card?.rarity ?? ""}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CardTrashBin;
