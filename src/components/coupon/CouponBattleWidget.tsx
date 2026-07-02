import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords, Skull } from "lucide-react";
import { useCouponBattle } from "@/hooks/useCouponBattle";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function CouponBattleWidget({ userId }: { userId: string | null }) {
  const { pair, vote, refresh, loading } = useCouponBattle();
  if (!pair) return null;
  const [a, b] = pair;
  const savings = (c: typeof a) => Math.round(((c.original_value - c.selling_price) / c.original_value) * 100);

  const Side = ({ c, side }: { c: typeof a; side: "a" | "b" }) => (
    <button
      onClick={() => vote(c.id, userId)}
      disabled={!userId || loading}
      className="flex-1 text-left p-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group disabled:opacity-60"
    >
      <div className="flex gap-3 items-center">
        {c.image_url ? (
          <img src={c.image_url} alt="" className="w-14 h-14 rounded-lg object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-pink-500/20" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.store_name}</p>
          <p className="font-semibold text-sm line-clamp-1">{c.title}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-base font-black text-primary">€{Number(c.selling_price).toFixed(2)}</span>
            <span className="text-[10px] text-success font-bold">−{savings(c)}%</span>
          </div>
        </div>
      </div>
      <div className="text-center mt-2 text-[11px] font-bold text-primary opacity-60 group-hover:opacity-100">
        Vote {side.toUpperCase()}
      </div>
    </button>
  );

  return (
    <>
      <FloatingHowItWorks title={"Coupon Battle Widget - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Battle Widget section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Battle Widget.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-violet-500/10 via-pink-500/5 to-amber-500/10 border-pink-500/30 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-pink-500" />
            <h3 className="font-bold text-sm">Coupon Battle — which deal wins?</h3>
          </div>
          <Button size="sm" variant="ghost" onClick={refresh}><Skull className="w-3 h-3" /></Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Side c={a} side="a" />
          <span className="text-xs font-black text-muted-foreground">VS</span>
          <Side c={b} side="b" />
        </div>
        {!userId && <p className="text-[11px] text-muted-foreground text-center mt-2">Login to vote — winner gets a hot-ranking boost.</p>}
      </CardContent>
    </Card>
    </>
  );
}
