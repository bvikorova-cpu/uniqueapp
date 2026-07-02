import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { useEducationLeaderboard } from "@/hooks/useEducationStats";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export const EducationLeaderboard = () => {
  const { data: rows, isLoading } = useEducationLeaderboard();

  return (
    <>
      <FloatingHowItWorks title="How Education Leaderboard works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Student Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : !rows || rows.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-7 h-7 text-yellow-500/40" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">No students ranked yet</p>
              <p className="text-xs text-muted-foreground">Complete quizzes to appear on the leaderboard!</p>
            </div>
          ) : (
            <ol className="space-y-1.5">
              {rows.map((row, i) => {
                const medalColor =
                  i === 0 ? "text-yellow-500" :
                  i === 1 ? "text-zinc-400" :
                  i === 2 ? "text-amber-700" : "text-muted-foreground";
                return (
                  <li
                    key={row.user_id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <span className={`w-5 text-center text-xs font-bold ${medalColor}`}>
                      {i < 3 ? <Medal className="w-4 h-4 inline" /> : i + 1}
                    </span>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={row.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[10px]">
                        {(row.full_name ?? "?").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs flex-1 truncate">
                      {row.full_name ?? "Anonymous"}
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {row.total_points.toLocaleString()} XP
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </motion.div>
    </>
    );
};
