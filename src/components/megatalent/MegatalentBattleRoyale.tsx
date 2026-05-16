import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Swords, Trophy } from "lucide-react";

const ROUNDS = [
  { label: "Round of 16", count: 16 },
  { label: "Quarter Finals", count: 8 },
  { label: "Semi Finals", count: 4 },
  { label: "Final", count: 2 },
  { label: "Champion", count: 1 },
];

const MegatalentBattleRoyale = ({ category }: { category?: string }) => {
  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-gradient-to-br from-destructive/10 via-primary/5 to-accent/10 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Swords className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-bold">Live Battle Royale</h3>
          <Badge variant="destructive" className="ml-auto animate-pulse">LIVE</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">16 talents enter. One legend remains. Vote each round.</p>
        <div className="flex items-end gap-2 overflow-x-auto pb-2">
          {ROUNDS.map((r, i) => (
            <motion.div key={r.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="flex-1 min-w-[90px] rounded-xl bg-background/50 border border-border/40 p-3 text-center">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{r.label}</div>
              <div className="text-2xl font-black mt-1 flex items-center justify-center gap-1">
                {i === ROUNDS.length - 1 ? <Trophy className="h-5 w-5 text-yellow-500" /> : null}
                {r.count}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MegatalentBattleRoyale;
