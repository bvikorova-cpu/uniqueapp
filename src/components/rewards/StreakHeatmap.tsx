import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function StreakHeatmap({ userId }: { userId: string }) {
  const { data: claims = [] } = useQuery({
    queryKey: ["streak-heatmap", userId],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 42);
      
      const { data } = await supabase
        .from("daily_rewards")
        .select("claimed_at")
        .eq("user_id", userId)
        .gte("claimed_at", thirtyDaysAgo.toISOString())
        .order("claimed_at", { ascending: true });
      return data || [];
    },
    enabled: !!userId,
  });

  // Build 42-day grid (6 weeks)
  const days: { date: string; active: boolean; label: string }[] = [];
  const claimDates = new Set(claims.map((c: any) => new Date(c.claimed_at).toISOString().split("T")[0]));

  for (let i = 41; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      active: claimDates.has(dateStr),
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  // Chunk into 7-column rows
  const firstDayOffset = new Date(days[0]?.date || "").getDay();

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-5 w-5 text-orange-500" />
          Login Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {weekDays.map((d, i) => (
            <div key={i} className="text-center text-[9px] sm:text-[10px] text-muted-foreground font-medium pb-1">
              {d}
            </div>
          ))}
          {days.map((day, i) => (
            <Tooltip key={day.date}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className={`aspect-square rounded-sm sm:rounded-md transition-colors ${
                    day.active
                      ? "bg-primary hover:bg-primary/80"
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                />
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                <p>{day.label}</p>
                <p className="text-muted-foreground">{day.active ? "✓ Logged in" : "No login"}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm bg-muted/30" />
            <div className="w-3 h-3 rounded-sm bg-primary/40" />
            <div className="w-3 h-3 rounded-sm bg-primary/70" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
