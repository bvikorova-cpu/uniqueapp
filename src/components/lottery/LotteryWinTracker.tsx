import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Search, CheckCircle, XCircle, AlertCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface LotteryWinTrackerProps {
  onBack: () => void;
}

const TRACKED_RESULTS = [
  {
    id: 1, lottery: "EuroJackpot", date: "2026-03-25",
    yourNumbers: [7, 14, 21, 28, 35], yourBonus: [3, 8],
    drawnNumbers: [7, 12, 21, 33, 45], drawnBonus: [3, 10],
    matches: 2, bonusMatches: 1, prize: "€12.50",
  },
  {
    id: 2, lottery: "EuroJackpot", date: "2026-03-22",
    yourNumbers: [5, 12, 23, 34, 45], yourBonus: [8, 11],
    drawnNumbers: [5, 12, 23, 34, 45], drawnBonus: [8, 11],
    matches: 5, bonusMatches: 2, prize: "JACKPOT! 🎉",
  },
  {
    id: 3, lottery: "Powerball", date: "2026-03-20",
    yourNumbers: [8, 15, 27, 33, 48], yourBonus: [6],
    drawnNumbers: [3, 15, 22, 33, 41], drawnBonus: [12],
    matches: 2, bonusMatches: 0, prize: null,
  },
  {
    id: 4, lottery: "Lotto 6/49", date: "2026-03-18",
    yourNumbers: [4, 11, 19, 25, 37, 44], yourBonus: [],
    drawnNumbers: [4, 11, 19, 30, 37, 48], drawnBonus: [],
    matches: 4, bonusMatches: 0, prize: "€45.00",
  },
];

const STATS = [
  { label: "Total Checked", value: "48", icon: Search, color: "text-blue-400" },
  { label: "Total Matches", value: "127", icon: CheckCircle, color: "text-emerald-400" },
  { label: "Prize Won", value: "€234.50", icon: Trophy, color: "text-yellow-400" },
  { label: "Best Match", value: "5+2", icon: TrendingUp, color: "text-violet-400" },
];

export function LotteryWinTracker({ onBack }: LotteryWinTrackerProps) {
  const getMatchColor = (matches: number, total: number) => {
    const ratio = matches / total;
    if (ratio >= 0.8) return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
    if (ratio >= 0.5) return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
    if (ratio >= 0.3) return "text-blue-400 bg-blue-500/20 border-blue-500/30";
    return "text-muted-foreground bg-muted/30 border-border/30";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            Win Tracker
          </h2>
          <p className="text-sm text-muted-foreground">Track if your numbers ever won</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-card/80 backdrop-blur-xl border-border/50">
              <CardContent className="pt-4 pb-4 text-center">
                <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-xl font-black">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Results List */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle className="font-black flex items-center gap-2">
            <Search className="h-5 w-5 text-emerald-400" />
            Recent Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {TRACKED_RESULTS.map((result, i) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl bg-muted/30 border border-border/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-sm">{result.lottery}</p>
                  <p className="text-[10px] text-muted-foreground">{result.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getMatchColor(result.matches, result.yourNumbers.length)}>
                    {result.matches}/{result.yourNumbers.length} matched
                  </Badge>
                  {result.prize && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      {result.prize}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Your Numbers:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.yourNumbers.map((num, idx) => {
                      const isMatch = result.drawnNumbers.includes(num);
                      return (
                        <div
                          key={idx}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                            isMatch
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-500/10 text-red-400/60 border border-red-500/20"
                          }`}
                        >
                          {num}
                        </div>
                      );
                    })}
                    {result.yourBonus.map((num, idx) => {
                      const isMatch = result.drawnBonus.includes(num);
                      return (
                        <div
                          key={`b-${idx}`}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                            isMatch
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : "bg-muted/50 text-muted-foreground border border-border/30"
                          }`}
                        >
                          {num}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Drawn Numbers:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.drawnNumbers.map((num, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary"
                      >
                        {num}
                      </div>
                    ))}
                    {result.drawnBonus.map((num, idx) => (
                      <div
                        key={`db-${idx}`}
                        className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xs font-black text-orange-500"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
