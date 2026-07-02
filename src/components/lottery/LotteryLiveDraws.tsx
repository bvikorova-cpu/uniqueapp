import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Radio, Clock, Globe, Trophy, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface LotteryLiveDrawsProps {
  onBack: () => void;
}

const LIVE_DRAWS = [
  {
    id: 1, lottery: "EuroJackpot", status: "live", nextDraw: "NOW",
    jackpot: "€87,000,000", numbers: [4, 17, 23, 31, 44], bonus: [2, 9],
    country: "🇪🇺 Europe", revealed: 5,
  },
  {
    id: 2, lottery: "Powerball", status: "upcoming", nextDraw: "2h 15m",
    jackpot: "$340,000,000", numbers: [], bonus: [],
    country: "🇺🇸 USA", revealed: 0,
  },
  {
    id: 3, lottery: "Mega Millions", status: "upcoming", nextDraw: "5h 30m",
    jackpot: "$215,000,000", numbers: [], bonus: [],
    country: "🇺🇸 USA", revealed: 0,
  },
  {
    id: 4, lottery: "Lotto 6/49", status: "completed", nextDraw: "Completed",
    jackpot: "€2,500,000", numbers: [6, 13, 22, 29, 38, 45], bonus: [],
    country: "🇸🇰 Slovakia", revealed: 6,
  },
];

const RECENT_RESULTS = [
  { lottery: "EuroJackpot", date: "Mar 25", numbers: [3, 11, 24, 37, 48], bonus: [5, 8], jackpot: "€64M" },
  { lottery: "Powerball", date: "Mar 24", numbers: [7, 19, 28, 42, 55], bonus: [14], jackpot: "$280M" },
  { lottery: "Lotto 6/49", date: "Mar 23", numbers: [2, 15, 21, 33, 40, 47], bonus: [], jackpot: "€1.8M" },
];

export function LotteryLiveDraws({ onBack }: LotteryLiveDrawsProps) {
  const [pulseActive, setPulseActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setPulseActive(p => !p), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <FloatingHowItWorks
        title='Lottery Live Draws'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Lottery Live Draws panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
            Live Draw Results
          </h2>
          <p className="text-sm text-muted-foreground">Real-time lottery draw results worldwide</p>
        </div>
      </div>

      {/* Live Draws */}
      <div className="space-y-4">
        {LIVE_DRAWS.map((draw, i) => (
          <motion.div
            key={draw.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`bg-card/80 backdrop-blur-xl ${
              draw.status === "live"
                ? "border-2 border-red-500/50 shadow-lg shadow-red-500/10"
                : "border-border/50"
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{draw.country.split(" ")[0]}</span>
                    <div>
                      <CardTitle className="text-base font-black">{draw.lottery}</CardTitle>
                      <p className="text-xs text-muted-foreground">{draw.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {draw.status === "live" && (
                      <Badge className="bg-red-500 text-white animate-pulse gap-1">
                        <Radio className="h-3 w-3" /> LIVE
                      </Badge>
                    )}
                    {draw.status === "upcoming" && (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" /> {draw.nextDraw}
                      </Badge>
                    )}
                    {draw.status === "completed" && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    <span className="font-black text-lg">{draw.jackpot}</span>
                  </div>
                </div>

                {draw.numbers.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {draw.numbers.map((num, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: idx * 0.15, type: "spring" }}
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shadow-lg ${
                          draw.status === "live"
                            ? "bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-red-500/20"
                            : "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-primary/20"
                        }`}
                      >
                        {num}
                      </motion.div>
                    ))}
                    {draw.bonus.map((num, idx) => (
                      <motion.div
                        key={`b-${idx}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: (draw.numbers.length + idx) * 0.15, type: "spring" }}
                        className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-orange-500/20"
                      >
                        {num}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Draw starts in {draw.nextDraw}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Results */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle className="font-black flex items-center gap-2">
            <Globe className="h-5 w-5 text-red-400" />
            Recent Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {RECENT_RESULTS.map((result, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-sm">{result.lottery}</p>
                  <span className="text-[10px] text-muted-foreground">{result.date}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.numbers.map((num, idx) => (
                    <div key={idx} className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                      {num}
                    </div>
                  ))}
                  {result.bonus.map((num, idx) => (
                    <div key={`b-${idx}`} className="w-7 h-7 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[10px] font-black text-orange-500">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
              <Badge variant="outline" className="shrink-0 text-[10px]">{result.jackpot}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
