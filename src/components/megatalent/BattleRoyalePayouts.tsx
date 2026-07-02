import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Loader2, Wallet, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { userId: string | null; }

type Win = { tournament_id: string; category: string; ends_at: string; prize_amount_cents: number; available_cents: number };
type Payout = { id: string; campaign_id: string; amount_cents: number; status: string; created_at: string };

const BattleRoyalePayouts = ({ userId }: Props) => {
  const [wins, setWins] = useState<Win[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      // 1. Find tournaments where user is champion via participants→tournament
      const { data: parts } = await supabase
        .from("battle_royale_participants")
        .select("id, tournament_id")
        .eq("user_id", userId);
      const partIds = (parts || []).map(p => p.id);
      if (!partIds.length) { setWins([]); setPayouts([]); setLoading(false); return; }

      const { data: tours } = await (supabase as any)
        .from("battle_royale_tournaments")
        .select("id, category, ends_at, prize_amount_cents, champion_participant_id, status")
        .in("champion_participant_id", partIds)
        .eq("status", "completed");

      const tIds = (tours || []).map((t: any) => t.id);
      const items: Win[] = [];
      for (const t of (tours || [])) {
        if ((t.prize_amount_cents || 0) <= 0) continue;
        const { data: avail } = await (supabase as any).rpc("get_battle_royale_available_payout", { _tournament_id: t.id });
        items.push({
          tournament_id: t.id, category: t.category, ends_at: t.ends_at,
          prize_amount_cents: t.prize_amount_cents || 0, available_cents: Number(avail ?? 0),
        });
      }
      setWins(items);

      // 2. List existing payouts
      const { data: po } = await supabase
        .from("campaign_payouts")
        .select("id, campaign_id, amount_cents, status, created_at")
        .eq("owner_user_id", userId).eq("campaign_type", "battle_royale")
        .order("created_at", { ascending: false }).limit(20);
      setPayouts((po as Payout[]) || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-line */ }, [userId]);

  const claim = async (tid: string) => {
    setClaiming(tid);
    try {
      const { data, error } = await supabase.functions.invoke("request-battle-royale-payout", { body: { tournament_id: tid } });
      if (error) throw error;
      if ((data as any)?.code === "NO_CONNECT_ACCOUNT") {
        toast.error("Set up Stripe Connect first");
        navigate("/payout-setup");
        return;
      }
      toast.success("Payout requested — awaiting admin approval");
      await load();
    } catch (e: any) { toast.error(e?.message || "Couldn't request payout"); }
    finally { setClaiming(null); }
  };

  if (!userId) return null;
  if (!loading && wins.length === 0 && payouts.length === 0) return null;

  return (
    <>
      <FloatingHowItWorks title={"Battle Royale Payouts - How it works"} steps={[{ title: 'Open', desc: 'Access the Battle Royale Payouts section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Battle Royale Payouts.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <h2 className="font-bold">Battle Royale Winnings</h2>
        </div>

        {loading ? (
          <div className="py-4 flex items-center justify-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>
        ) : (
          <>
            {wins.map(w => (
              <div key={w.tournament_id} className="rounded-lg border border-yellow-500/30 bg-background/40 p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="text-sm font-semibold flex items-center gap-2"><Trophy className="h-3.5 w-3.5 text-yellow-500" /> Champion · {w.category}</div>
                  <div className="text-xs text-muted-foreground">Prize: €{(w.prize_amount_cents / 100).toFixed(2)} · Available: €{(w.available_cents / 100).toFixed(2)}</div>
                </div>
                <Button size="sm" disabled={w.available_cents <= 0 || claiming === w.tournament_id} onClick={() => claim(w.tournament_id)} className="gap-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold">
                  {claiming === w.tournament_id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wallet className="h-3.5 w-3.5" />}
                  {w.available_cents > 0 ? "Claim" : "Already claimed"}
                </Button>
              </div>
            ))}

            {payouts.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Payout history</div>
                {payouts.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-xs rounded border border-border/30 bg-background/30 px-2.5 py-1.5">
                    <div className="flex items-center gap-2">
                      {p.status === "completed" ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> :
                       p.status === "failed" || p.status === "rejected" ? <AlertCircle className="h-3.5 w-3.5 text-destructive" /> :
                       <Clock className="h-3.5 w-3.5 text-amber-500" />}
                      <span className="font-mono">€{(p.amount_cents / 100).toFixed(2)}</span>
                      <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                    </div>
                    <span className="text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}

            {wins.length === 0 && payouts.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">Win a Battle Royale tournament to earn EUR prizes paid directly to your bank.</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
    </>
  );
};

export default BattleRoyalePayouts;
