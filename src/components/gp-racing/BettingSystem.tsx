import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Coins, TrendingUp, TrendingDown, Clock, Trophy, Flame, Star, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface RaceBet {
  id: string;
  raceName: string;
  status: "open" | "live" | "settled";
  startTime: string;
  drivers: { name: string; odds: number; trend: "up" | "down" | "stable" }[];
}

const availableBets: RaceBet[] = [
  {
    id: "1", raceName: "Asteroid Belt GP", status: "open", startTime: "Starting in 15 min",
    drivers: [
      { name: "James K.", odds: 2.5, trend: "up" },
      { name: "Priya S.", odds: 3.1, trend: "stable" },
      { name: "Mei L.", odds: 4.0, trend: "down" },
      { name: "Carlos R.", odds: 6.5, trend: "up" },
      { name: "Sofia A.", odds: 8.0, trend: "stable" },
    ],
  },
  {
    id: "2", raceName: "Solar Flare GP", status: "open", startTime: "Starting in 1h 30min",
    drivers: [
      { name: "Yuki T.", odds: 1.8, trend: "up" },
      { name: "James K.", odds: 3.0, trend: "stable" },
      { name: "Omar H.", odds: 5.5, trend: "down" },
      { name: "Alex M.", odds: 7.0, trend: "up" },
    ],
  },
  {
    id: "3", raceName: "Quantum Horizon GP", status: "live", startTime: "Lap 23/45",
    drivers: [
      { name: "Priya S.", odds: 1.5, trend: "up" },
      { name: "Mei L.", odds: 2.8, trend: "down" },
      { name: "James K.", odds: 4.2, trend: "down" },
    ],
  },
];

const betHistory = [
  { race: "Nebula Drift GP", driver: "James K.", amount: 50, odds: 2.5, result: "won", payout: 125 },
  { race: "Plasma Storm GP", driver: "Mei L.", amount: 30, odds: 3.0, result: "lost", payout: 0 },
  { race: "Dark Matter GP", driver: "Priya S.", amount: 100, odds: 1.8, result: "won", payout: 180 },
  { race: "Cosmic Rift GP", driver: "Carlos R.", amount: 25, odds: 6.5, result: "lost", payout: 0 },
];

export function BettingSystem({ onBack }: { onBack: () => void }) {
  const [showBetDialog, setShowBetDialog] = useState(false);
  const [selectedBet, setSelectedBet] = useState<{ raceId: string; driver: string; odds: number } | null>(null);
  const [betAmount, setBetAmount] = useState("50");
  const [tab, setTab] = useState<"races" | "history">("races");

  const totalWon = betHistory.filter(b => b.result === "won").reduce((s, b) => s + b.payout, 0);
  const totalLost = betHistory.filter(b => b.result === "lost").reduce((s, b) => s + b.amount, 0);

  const placeBet = () => {
    if (!selectedBet || !betAmount || Number(betAmount) <= 0) { toast.error("Enter a valid bet amount"); return; }
    const potential = (Number(betAmount) * selectedBet.odds).toFixed(0);
    toast.success(`Bet placed! ${betAmount} Coins on ${selectedBet.driver} @ ${selectedBet.odds}x — Potential win: ${potential} Coins 🎰`);
    setShowBetDialog(false);
    setSelectedBet(null);
    setBetAmount("50");
  };

  return (
    <>
      <FloatingHowItWorks title={"Betting System - How it works"} steps={[{ title: 'Open', desc: 'Access the Betting System section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Betting System.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-cyan-400 hover:bg-cyan-950/30">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-mono font-bold text-white uppercase tracking-wider">Race Betting</h2>
          <p className="text-[10px] font-mono text-cyan-400/40 uppercase tracking-[0.3em]">Wager coins on race outcomes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 bg-slate-900/60 border-emerald-500/20 backdrop-blur-sm text-center">
          <TrendingUp className="h-4 w-4 mx-auto text-emerald-400 mb-1" />
          <p className="font-mono font-bold text-lg text-emerald-400">{totalWon}</p>
          <p className="text-[9px] font-mono text-cyan-400/40 uppercase">Total Won</p>
        </Card>
        <Card className="p-3 bg-slate-900/60 border-red-500/20 backdrop-blur-sm text-center">
          <TrendingDown className="h-4 w-4 mx-auto text-red-400 mb-1" />
          <p className="font-mono font-bold text-lg text-red-400">{totalLost}</p>
          <p className="text-[9px] font-mono text-cyan-400/40 uppercase">Total Lost</p>
        </Card>
        <Card className="p-3 bg-slate-900/60 border-amber-500/20 backdrop-blur-sm text-center">
          <Coins className="h-4 w-4 mx-auto text-amber-400 mb-1" />
          <p className={`font-mono font-bold text-lg ${totalWon - totalLost >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {totalWon - totalLost >= 0 ? "+" : ""}{totalWon - totalLost}
          </p>
          <p className="text-[9px] font-mono text-cyan-400/40 uppercase">Net Profit</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button variant={tab === "races" ? "default" : "outline"} size="sm" onClick={() => setTab("races")}
          className={tab === "races" ? "bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400/30 font-mono text-xs uppercase" : "border-cyan-500/30 text-cyan-300 font-mono text-xs uppercase"}>
          <Flame className="h-3.5 w-3.5 mr-1.5" /> Open Bets
        </Button>
        <Button variant={tab === "history" ? "default" : "outline"} size="sm" onClick={() => setTab("history")}
          className={tab === "history" ? "bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400/30 font-mono text-xs uppercase" : "border-cyan-500/30 text-cyan-300 font-mono text-xs uppercase"}>
          <Clock className="h-3.5 w-3.5 mr-1.5" /> History
        </Button>
      </div>

      {tab === "races" && (
        <div className="space-y-4">
          {availableBets.map((race, ri) => (
            <motion.div key={race.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ri * 0.1 }}>
              <Card className="p-4 bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-mono font-bold text-white">{race.raceName}</h3>
                    <p className="text-[10px] font-mono text-cyan-400/40">{race.startTime}</p>
                  </div>
                  <Badge className={`font-mono text-[10px] ${race.status === "live" ? "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse" : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"}`}>
                    {race.status === "live" ? "LIVE" : "OPEN"}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {race.drivers.map((driver, di) => (
                    <div key={di} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/50 border border-cyan-500/5 hover:border-cyan-400/20 transition-all">
                      <span className="font-mono text-sm text-white flex-1">{driver.name}</span>
                      <div className="flex items-center gap-1">
                        {driver.trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-400" />}
                        {driver.trend === "down" && <TrendingDown className="h-3 w-3 text-red-400" />}
                        <span className="font-mono font-bold text-sm text-amber-400">{driver.odds}x</span>
                      </div>
                      <Button size="sm" onClick={() => { setSelectedBet({ raceId: race.id, driver: driver.name, odds: driver.odds }); setShowBetDialog(true); }}
                        className="bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/20 text-cyan-300 font-mono text-[10px] h-7 px-3">
                        BET
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-2">
          {betHistory.map((bet, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl border backdrop-blur-sm ${
                bet.result === "won" ? "bg-emerald-950/20 border-emerald-500/20" : "bg-red-950/20 border-red-500/20"
              }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                bet.result === "won" ? "bg-emerald-500/20" : "bg-red-500/20"
              }`}>
                {bet.result === "won" ? <Trophy className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-red-400" />}
              </div>
              <div className="flex-1">
                <p className="font-mono font-bold text-sm text-white">{bet.race}</p>
                <p className="text-[10px] font-mono text-cyan-400/40">{bet.driver} @ {bet.odds}x</p>
              </div>
              <div className="text-right">
                <p className={`font-mono font-bold text-sm ${bet.result === "won" ? "text-emerald-400" : "text-red-400"}`}>
                  {bet.result === "won" ? `+${bet.payout}` : `-${bet.amount}`}
                </p>
                <p className="text-[9px] font-mono text-cyan-400/30">Bet: {bet.amount}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Bet Dialog */}
      <Dialog open={showBetDialog} onOpenChange={setShowBetDialog}>
        <DialogContent className="bg-slate-950/95 border-cyan-500/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-cyan-300 font-mono uppercase tracking-wider flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-400" /> Place Bet
            </DialogTitle>
          </DialogHeader>
          {selectedBet && (
            <div className="space-y-4">
              <Card className="p-4 bg-slate-900/50 border-cyan-500/15">
                <p className="font-mono text-sm text-white">Driver: <span className="text-cyan-300">{selectedBet.driver}</span></p>
                <p className="font-mono text-sm text-white mt-1">Odds: <span className="text-amber-400">{selectedBet.odds}x</span></p>
              </Card>
              <div>
                <label className="text-cyan-300 font-mono text-xs uppercase tracking-wider block mb-1.5">Bet Amount (Coins)</label>
                <Input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)} min={1}
                  className="bg-slate-900/50 border-cyan-500/30 text-white font-mono" />
                <p className="text-xs font-mono text-cyan-400/40 mt-1">
                  Potential win: <span className="text-amber-400 font-bold">{(Number(betAmount) * selectedBet.odds).toFixed(0)} Coins</span>
                </p>
              </div>
              <div className="flex gap-2">
                {[25, 50, 100, 250].map(amount => (
                  <Button key={amount} variant="outline" size="sm" onClick={() => setBetAmount(String(amount))}
                    className="flex-1 border-cyan-500/20 text-cyan-300 font-mono text-xs hover:bg-cyan-950/30">
                    {amount}
                  </Button>
                ))}
              </div>
              <Button onClick={placeBet}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 border border-amber-400/30 font-mono uppercase tracking-wider">
                Place Bet
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
