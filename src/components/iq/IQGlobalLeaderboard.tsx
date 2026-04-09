import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, Award, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  rank: number;
  username: string;
  iq: number;
  tests: number;
  league: string;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: "BrainMaster_X", iq: 156, tests: 42, league: "Legend" },
  { rank: 2, username: "CogniQueen", iq: 148, tests: 38, league: "Grandmaster" },
  { rank: 3, username: "NeuralNinja", iq: 145, tests: 55, league: "Grandmaster" },
  { rank: 4, username: "MindSculptor", iq: 142, tests: 31, league: "Grandmaster" },
  { rank: 5, username: "ThinkTank99", iq: 139, tests: 47, league: "Master" },
  { rank: 6, username: "LogicLord", iq: 137, tests: 29, league: "Master" },
  { rank: 7, username: "IQ_Titan", iq: 135, tests: 60, league: "Master" },
  { rank: 8, username: "BrainWave_Pro", iq: 132, tests: 23, league: "Master" },
  { rank: 9, username: "Synapse42", iq: 130, tests: 34, league: "Master" },
  { rank: 10, username: "QuantumMind", iq: 128, tests: 41, league: "Diamond" },
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
};

const getRankBg = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-yellow-500/15 to-amber-500/10 border-yellow-500/30";
  if (rank === 2) return "bg-gradient-to-r from-gray-400/10 to-gray-500/5 border-gray-400/20";
  if (rank === 3) return "bg-gradient-to-r from-amber-700/10 to-amber-800/5 border-amber-700/20";
  return "border-border/30";
};

export default function IQGlobalLeaderboard() {
  return (
    <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">🌍 Global Leaderboard</h2>
      <Card className="bg-gradient-to-br from-indigo-500/5 to-blue-500/5 border-indigo-500/20">
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 10 Worldwide
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          {mockLeaderboard.map((entry, i) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 p-2.5 rounded-lg border ${getRankBg(entry.rank)} transition-all`}
            >
              <div className="flex items-center justify-center w-8">{getRankIcon(entry.rank)}</div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="p-1.5 rounded-full bg-muted">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{entry.username}</p>
                  <p className="text-[10px] text-muted-foreground">{entry.tests} tests</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] shrink-0">{entry.league}</Badge>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-blue-500">{entry.iq}</p>
                <p className="text-[9px] text-muted-foreground">IQ</p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
