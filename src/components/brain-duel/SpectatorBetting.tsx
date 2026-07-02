import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Coins, TrendingUp, AlertTriangle, Loader2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBrainDuelCredits } from "@/hooks/useBrainDuelCredits";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  matchId: string;
  player1Name: string;
  player2Name: string;
  player1Id: string;
  player2Id: string;
}

export const SpectatorBetting = ({ matchId, player1Name, player2Name, player1Id, player2Id }: Props) => {
  const { credits, spendCredits } = useBrainDuelCredits();
  const [betAmount, setBetAmount] = useState(5);
  const [placing, setPlacing] = useState(false);
  const [betPlaced, setBetPlaced] = useState<{ playerId: string; amount: number } | null>(null);

  const placeBet = async (playerId: string) => {
    if (betAmount < 1 || betAmount > 100) {
      toast.error("Bet must be between 1-100 credits");
      return;
    }
    if (credits < betAmount) {
      toast.error("Not enough credits!");
      return;
    }

    setPlacing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }

      spendCredits(betAmount);

      const { error } = await supabase.from("brain_duel_spectator_bets").insert({
        user_id: user.id,
        match_id: matchId,
        bet_on_player_id: playerId,
        bet_amount: betAmount,
        status: "pending",
      });

      if (error) throw error;
      setBetPlaced({ playerId, amount: betAmount });
      toast.success(`Bet placed! ${betAmount} credits on ${playerId === player1Id ? player1Name : player2Name}`, {
        description: "If they win, you earn 2× your bet!",
      });
    } catch (e) {
      toast.error("Failed to place bet");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Spectator Betting - How it works"} steps={[{ title: 'Open', desc: 'Access the Spectator Betting section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Spectator Betting.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-amber-500/20 backdrop-blur-xl bg-card/80 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Coins className="h-4 w-4 text-amber-400" />
          Spectator Betting
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px]">
            Virtual Credits
          </Badge>
        </CardTitle>
        <CardDescription className="text-[11px]">
          Bet virtual credits on who you think will win!
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-3">
        {betPlaced ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center"
          >
            <TrendingUp className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-bold text-sm">Bet Placed!</p>
            <p className="text-xs text-muted-foreground">
              {betPlaced.amount} credits on{" "}
              <span className="font-semibold text-foreground">
                {betPlaced.playerId === player1Id ? player1Name : player2Name}
              </span>
            </p>
            <p className="text-[10px] text-emerald-400 mt-1">Potential payout: {betPlaced.amount * 2} credits</p>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={100}
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="w-20 h-8 text-sm text-center"
              />
              <span className="text-xs text-muted-foreground">credits (you have {credits})</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => placeBet(player1Id)}
                disabled={placing || credits < betAmount}
                className="h-auto py-3 flex-col gap-1 border-primary/20 hover:bg-primary/10"
              >
                {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold">{player1Name}</span>
                    <span className="text-[10px] text-muted-foreground">2× payout</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => placeBet(player2Id)}
                disabled={placing || credits < betAmount}
                className="h-auto py-3 flex-col gap-1 border-orange-500/20 hover:bg-orange-500/10"
              >
                {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    <Users className="h-4 w-4 text-orange-400" />
                    <span className="text-xs font-bold">{player2Name}</span>
                    <span className="text-[10px] text-muted-foreground">2× payout</span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                Virtual credits only. No real money. For entertainment purposes.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </>
  );
};
