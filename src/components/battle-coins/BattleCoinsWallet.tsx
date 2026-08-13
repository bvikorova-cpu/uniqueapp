import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, ArrowRight, Info } from "lucide-react";
import { useBattleCoins, COINS_PER_CREDIT, BATTLE_ENTRY_COINS, BATTLE_PRIZE_COINS } from "@/hooks/useBattleCoins";

const PACKS = [1, 5, 10, 25];

/**
 * Battle Coins wallet + one-way credit exchange.
 * Coins are the only currency accepted in KitchenStars and Reel Battles, which keeps
 * purchased AI credits isolated from competitive play.
 */
export default function BattleCoinsWallet({ accent = "primary" }: { accent?: "primary" | "orange" }) {
  const { coins, credits, busy, exchange } = useBattleCoins();
  const [selected, setSelected] = useState<number>(5);
  const accentText = accent === "orange" ? "text-orange-500" : "text-primary";
  const accentBorder = accent === "orange" ? "border-orange-500/20" : "border-primary/20";

  return (
    <Card className={accentBorder}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Coins className={`h-5 w-5 ${accentText}`} /> Battle Coins wallet
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Duels run on Battle Coins only — your AI credits stay untouched everywhere else on Unique.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-primary/20 bg-secondary/20 p-3">
            <p className="text-xs text-muted-foreground">Battle Coins</p>
            <p className="text-2xl font-black tabular-nums">{coins.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-secondary/20 p-3">
            <p className="text-xs text-muted-foreground">AI credits</p>
            <p className="text-2xl font-black tabular-nums">{credits.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold flex items-center gap-2">
            Exchange rate
            <Badge variant="outline">1 credit = {COINS_PER_CREDIT} coins</Badge>
          </p>
          <div className="grid grid-cols-4 gap-2">
            {PACKS.map(p => (
              <button
                key={p}
                onClick={() => setSelected(p)}
                className={`rounded-xl border p-2 text-center transition-colors ${
                  selected === p ? "border-primary bg-primary/10" : "border-border bg-secondary/20 hover:bg-secondary/40"
                }`}
              >
                <p className="text-sm font-bold">{p} cr</p>
                <p className="text-[11px] text-muted-foreground">{(p * COINS_PER_CREDIT).toLocaleString()}</p>
              </button>
            ))}
          </div>
          <Button className="w-full" disabled={busy || credits < selected} onClick={() => exchange(selected)}>
            {busy ? "Exchanging..." : (
              <>
                {selected} credits <ArrowRight className="h-4 w-4 mx-2" /> {(selected * COINS_PER_CREDIT).toLocaleString()} coins
              </>
            )}
          </Button>
          {credits < selected && (
            <p className="text-xs text-destructive text-center">You need {selected} AI credits for this exchange.</p>
          )}
        </div>

        <div className="rounded-xl border border-primary/20 bg-secondary/20 p-3 space-y-1">
          <p className="text-xs font-semibold flex items-center gap-2">
            <Info className="h-3.5 w-3.5" /> How Battle Coins work
          </p>
          <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
            <li>Duel entry costs {BATTLE_ENTRY_COINS} coins, the winner takes {BATTLE_PRIZE_COINS.toLocaleString()} coins + 10 XP.</li>
            <li>Coins buy cosmetics only — profile frames, stickers and badges.</li>
            <li>The exchange is one-way: coins can never be converted back into AI credits.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
