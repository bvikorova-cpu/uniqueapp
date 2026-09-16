import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Zap, Brain, Timer, Gavel, Loader2, ShoppingCart } from "lucide-react";

export const CLONE_POWERUPS = [
  { key: "sharp_wit", name: "Sharp Wit", cost: 2, effect: "+6 score", icon: Sparkles, desc: "Sharper, funnier punchlines in every round." },
  { key: "silver_tongue", name: "Silver Tongue", cost: 4, effect: "+12 score", icon: Zap, desc: "Charismatic rhetoric that impresses the judge." },
  { key: "iron_logic", name: "Iron Logic", cost: 4, effect: "+12 score", icon: Brain, desc: "Airtight logic that exposes the rival's weak points." },
  { key: "extra_round", name: "Extra Round", cost: 3, effect: "+1 round, +4 score", icon: Timer, desc: "One additional round where your clone pushes for the finish." },
  { key: "judge_favor", name: "Judge's Favor", cost: 6, effect: "+18 score", icon: Gavel, desc: "The judge openly favours your clone's style." },
] as const;

export const MAX_POWERUPS_PER_BATTLE = 2;

export type PowerupInventory = Record<string, number>;

export function useClonePowerups() {
  const [inventory, setInventory] = useState<PowerupInventory>({});

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("clone_battle_powerups")
      .select("powerup_key, quantity")
      .eq("user_id", user.id);
    const map: PowerupInventory = {};
    for (const row of data ?? []) map[row.powerup_key] = row.quantity;
    setInventory(map);
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("clone-powerups-updated", handler);
    return () => window.removeEventListener("clone-powerups-updated", handler);
  }, []);

  return { inventory, reload: load };
}

export function ClonePowerupShop() {
  const { toast } = useToast();
  const { inventory } = useClonePowerups();
  const [buying, setBuying] = useState<string | null>(null);

  const buy = async (key: string, cost: number, name: string) => {
    setBuying(key);
    try {
      const { data, error } = await supabase.functions.invoke("buy-clone-powerup", {
        body: { powerupKey: key, quantity: 1 },
      });
      if (error) {
        let msg = error.message || "Purchase failed";
        const ctx: any = (error as any).context;
        try {
          if (ctx && typeof ctx.json === "function") {
            const body = await ctx.clone().json();
            if (body?.error) msg = String(body.error);
          }
        } catch { /* keep generic message */ }
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);
      toast({ title: `${name} purchased`, description: `${cost} credits spent. Activate it before your next battle.` });
      window.dispatchEvent(new Event("ai-credits-updated"));
      window.dispatchEvent(new Event("clone-powerups-updated"));
    } catch (e: any) {
      toast({ title: "Purchase failed", description: e.message || "Please try again", variant: "destructive" });
    } finally {
      setBuying(null);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart className="h-4 w-4 text-primary" /> Battle boosts
        </CardTitle>
        <CardDescription>
          Buy special abilities with credits to make your clone stronger in the arena. You can activate up to {MAX_POWERUPS_PER_BATTLE} boosts per battle.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {CLONE_POWERUPS.map((p) => {
          const Icon = p.icon;
          const owned = inventory[p.key] ?? 0;
          return (
            <div key={p.key} className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {p.name}
                  <Badge variant="outline" className="text-[10px]">{p.effect}</Badge>
                  {owned > 0 && <Badge className="text-[10px]">owned {owned}</Badge>}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">{p.desc}</p>
              </div>
              <Button size="sm" variant="outline" disabled={buying === p.key} onClick={() => buy(p.key, p.cost, p.name)}>
                {buying === p.key ? <Loader2 className="h-4 w-4 animate-spin" /> : `${p.cost} cr`}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
